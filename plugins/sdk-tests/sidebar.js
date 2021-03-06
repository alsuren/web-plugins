async function testAll() {
	await testViewportCommands()
	await testCommonWidgetCommands()
	await testShapes()
	await testStickers()
	await testImages()
	await testFrames()
	await testEvents()

	rtb.showNotification('Test completed')
}

async function testViewportCommands() {
	let boardInfo = await rtb.board.getInfo()
	assertEq(typeof boardInfo.id, 'string', 'board.getInfo should return boardInfo')

	await rtb.board.setZoom(2)
	await rtb.board.setZoom(1)
	let zoom = await rtb.board.getZoom()
	assertEq(zoom, 1, 'setZoom and getZoom should work')

	let currentVP = await rtb.board.getViewport()
	let targetVP = {...currentVP, x: currentVP.x + 100}
	let newVP = await rtb.board.setViewport(targetVP)
	assertEq(targetVP, newVP, 'getViewport and setViewport should work')

	await rtb.board.setViewportWithAnimation(currentVP)
	newVP = await rtb.board.getViewport()
	assertEq(currentVP, newVP, 'setViewportWithAnimation should work')

	console.log('Done: testViewportCommands')
}

async function testCommonWidgetCommands() {
	await clearBoard()

	await rtb.board.widgets.shapes.create()
	await rtb.board.widgets.stickers.create({x: 150})
	let allObjects = await rtb.board.getAllObjects()
	assertCondition(allObjects.length === 2, 'shape and sticker should had been created')

	let selection = await rtb.board.getSelection()
	assertCondition(selection.length === 0, 'selection should be empty')

	await rtb.board.selectWidgets(allObjects.map(o => o.id))
	selection = await rtb.board.getSelection()
	assertCondition(selection.length === 2, 'shape and sticker should had been selected')

	let objId1 = allObjects[0].id
	let objId2 = allObjects[1].id
	let obj1 = await rtb.board.getById(objId1)
	let obj2 = await rtb.board.getById(objId2)
	assertEq(allObjects[0], obj1, 'getById should work 1')
	assertNotEq(allObjects[0], obj2, 'getById should work 2')

	await rtb.board.transformDelta(obj1.id, 10, 10, 10)
	let obj11 = await rtb.board.getById(obj1.id)
	assertEq(obj11.x, obj1.x + 10, 'transformDelta.x should work')
	assertEq(obj11.y, obj1.y + 10, 'transformDelta.y should work')
	assertEq(obj11.rotation, obj1.rotation + 10, 'transformDelta.rotation should work')

	await rtb.board.transformDelta(obj2.id, undefined, undefined, 10)
	let obj22 = await rtb.board.getById(obj2.id)
	assertEq(obj22.rotation, obj2.rotation, 'transformDelta.rotation should not work in stickers')

	await rtb.board.transform([{objectId: obj1.id, x: 20, y: 20, rotation: 20}])
	obj11 = await rtb.board.getById(obj1.id)
	assertEq(obj11.x, 20, 'transform.x should work')
	assertEq(obj11.y, 20, 'transform.y should work')
	assertEq(obj11.rotation, 20, 'transform.rotation should work')

	await rtb.board.transform([{objectId: obj1.id, y: 50}])
	obj11 = await rtb.board.getById(obj1.id)
	assertEq(obj11.x, 20, 'partial transform.x should work')
	assertEq(obj11.y, 50, 'partial transform.y should work')

	console.log('Done: testCommonWidgetCommands')
}

async function testShapes() {
	await clearBoard()

	let shape = await rtb.board.widgets.shapes.create({width: 200, height: 300, text: 'hello', style: {textColor: '#F00', borderColor: 'transparent'}})
	let shapes = await rtb.board.widgets.shapes.get()

	assertEq(shapes.length, 1, 'there are should be only one shape')
	assertEq(shapes[0], shape, 'shapes.get() should work')
	assertEq(shape.width, 200, 'shapes.create width should work')
	assertEq(shape.height, 300, 'shapes.create height should work')
	assertEq(shape.text, 'hello', 'shapes.create text should work')
	assertEq(shape.style.textColor, '#ff0000', 'shapes.create textColor should work')
	assertEq(shape.style.borderColor, 'transparent', 'shapes.create borderColor should work')

	let updatingShapeData = {width: 100, height: 100, text: '', style: {textColor: '#00ff00'}}
	let updatedShape = await rtb.board.widgets.shapes.update(shape.id, updatingShapeData)
	assertEq(updatedShape.height, updatingShapeData.width, 'shapes.update height should work')
	assertEq(updatedShape.width, updatingShapeData.height, 'shapes.update width should work')
	assertEq(updatedShape.text, updatingShapeData.text, 'shapes.update text should work')
	assertEq(updatedShape.style.textColor, updatingShapeData.style.textColor, 'shapes.update textColor should work')
	assertEq(updatedShape.style.borderColor, 'transparent', 'shapes.update borderColor should work')

	console.log('Done: testShapes')
}

async function testStickers() {
	await clearBoard()

	let sticker = await rtb.board.widgets.stickers.create({width: 199, text: 'hello', style: {textAlign: 'l', stickerBackgroundColor: '#ff0000'}})
	let stickers = await rtb.board.widgets.stickers.get()
	assertEq(stickers.length, 1, 'there are should be only one sticker')
	assertEq(stickers[0], sticker, 'sticker.get() should work')
	assertEq(sticker.width, 199, 'stickers.create width should work')
	assertEq(sticker.text, 'hello', 'stickers.create text should work')
	assertEq(sticker.style.stickerBackgroundColor, '#ff0000', 'stickers.create backgroundColor should work')
	assertEq(sticker.style.textAlign, 'l', 'stickers.create textAlign should work')

	let updatingStickerData = {width: 398, text: '', style: {stickerBackgroundColor: '#00ff00'}}
	let updatedSticker = await rtb.board.widgets.stickers.update(sticker.id, updatingStickerData)

	assertEq(updatedSticker.width, 398, 'stickers.update width should work')
	assertEq(updatedSticker.text, updatingStickerData.text, 'stickers.update text should work')
	assertEq(updatedSticker.style.stickerBackgroundColor, updatingStickerData.style.stickerBackgroundColor, 'stickers.update stickerBackgroundColor should work')
	assertEq(updatedSticker.style.textAlign, 'l', 'stickers.update textAlign should not change')

	console.log('Done: testStickers')
}

async function testImages() {
	await clearBoard()

	const imgURL = 'https://hsto.org/webt/fo/u0/zl/fou0zlybtv_lmaatmyrfcktrkro.jpeg'
	const imgWidth = 800
	const imgHeight = 439

	let image = await rtb.board.widgets.images.createByURL(imgURL)
	assertEq(image.width, imgWidth, 'image.create with no width')
	assertEq(image.height, imgHeight, 'image.create with no width')

	let newImageTitle = 'new title'
	let updatedImage = (await rtb.board.widgets.images.update(image.id, {width: 400, title: newImageTitle}))
	assertEq(updatedImage.title, newImageTitle, 'image.update newImageTitle should work')
	assertEq(updatedImage.width, 400, 'image.update width should work')

	image = await rtb.board.widgets.images.createByURL(imgURL, {width: 200})
	assertEq(image.width, 200, 'image created with preset width')

	console.log('Done: testImages')
}

async function testScreenshots() {
	await clearBoard()

	const url = 'https://google.com'

	let widget = await rtb.board.widgets.webScreenshots.create(url)
	let widgets = await rtb.board.widgets.webScreenshots.get()
	assertEq(widgets.length, 1, 'webScreenshots.create should work')

	let updatedWidget = await rtb.board.widgets.webScreenshots.update(widget.id, {width: 400})
	assertEq(updatedWidget.width, 400, 'webScreenshots.update width should work')

	console.log('Done: testWebScreenshot')
}

async function testEmbeds() {
	await clearBoard()

	const url = 'https://youtu.be/bg2nznWly60'
	const code = '<iframe width="560" height="315" src="https://www.youtube.com/embed/bg2nznWly60" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>'

	let widget = await rtb.board.widgets.embeds.create(url, {x: 200})
	let widgets = await rtb.board.widgets.embeds.get()
	assertEq(widgets.length, 1, 'embeds.create with url')
	assertEq(widget.x, 200, 'embeds.create with x')

	let codeWidget = await rtb.board.widgets.embeds.create(code, {x: 600, y: 600})
	widgets = await rtb.board.widgets.embeds.get()
	assertEq(widgets.length, 2, 'embeds.create with htmlCode')

	let updatedWidget = await rtb.board.widgets.embeds.update(codeWidget.id, {width: 1200})
	assertEq(updatedWidget.width, 1200, 'embeds.update width should work')

	console.log('Done: testEmbeds')
}

async function testTexts() {
	await clearBoard()

	let widget = await rtb.board.widgets.texts.create({text: 'Hello', style:{textColor: '#F00', borderColor: 'transparent'}})
	let widgets = await rtb.board.widgets.texts.get()
	assertEq(widgets.length, 1, 'texts.create')
	assertEq(widget.text, 'Hello', 'texts.create text should work')
	assertEq(widget.style.textColor, '#ff0000', 'texts.create textColor should work')
	assertEq(widget.style.borderColor, 'transparent', 'texts.create borderColor should work')

	let updatedWidget = await rtb.board.widgets.texts.update(widget.id, {text: 'Hello world', style: {backgroundColor:'#aeaeae', borderColor:'#808080'}})
	assertEq(updatedWidget.text, 'Hello world', 'texts.create text should work')
	assertEq(updatedWidget.style.backgroundColor, '#aeaeae', 'texts.create textColor should work')
	assertEq(updatedWidget.style.borderColor, '#808080', 'texts.create borderColor should work')

	console.log('Done: testTexts')
}

async function testFrames() {
	await clearBoard()

	let frame = await rtb.board.frames.create({title: "test frame", x: 100, y: 100, width: 500, height: 500, style: {backgroundColor: "#808080"}})
	let frames = await rtb.board.frames.get()
	assertEq(frames[0], frame, 'frame.get() should work')
	assertEq(frame.width, 500, 'frame.create width should work')
	assertEq(frame.title, 'test frame', 'frame.create title should work')
	assertEq(frame.style.backgroundColor, "#808080", 'frame.create backgroundColor should work')

	let updatingFrameData = {width: 700, title: 'updated frame'}
	let updatedFrame = await rtb.board.frames.update(frame.id, updatingFrameData)

	assertEq(updatedFrame.width, 700, 'frame.update width should work')
	assertEq(updatedFrame.title, updatingFrameData.title, 'frame.update title should work')

	let shape = await rtb.board.widgets.shapes.create({width: 200, height: 300, text: 'hello', style: {textColor: '#F00', borderColor: 'transparent'}})
	await rtb.board.frames.setFrameChildren(frame.id, [shape.id])
	let children = await rtb.board.frames.getFrameChildren(frame.id)
	assertEq(children.length, 1, 'frames.getChildren should work')

	await rtb.board.frames.setFrameChildren(frame.id, [])
	children = await rtb.board.frames.getFrameChildren(frame.id)
	assertEq(children.length, 0, 'frames.getChildren should work')

	console.log('Done: testFrames')
}

async function testEvents() {
	await testSelectionUpdatedEvent()
	await testWidgetsCreatedEvent()
	await testWidgetsUpdatedEvent()
	await testWidgetsDeletedEvent()
}

async function testSelectionUpdatedEvent() {
	let shape = await rtb.board.widgets.shapes.create()
	await rtb.board.selectWidgets([])
	let selection = await getDataFromEvent(rtb.enums.event.SELECTION_UPDATED, () => {
		rtb.board.selectWidgets(shape.id)
	})
	assertEq(selection.length, 1, 'selected only one widget')
	assertEq(selection[0].id, shape.id, 'selected the target shape')

	console.log('Done: SELECTION_UPDATED')
}

async function testWidgetsCreatedEvent() {
	let createdWidgets = await getDataFromEvent(rtb.enums.event.WIDGETS_DELETED, () => {
		rtb.board.widgets.shapes.create()
	})
	assertEq(createdWidgets.length, 1, 'created one widget')

	console.log('Done: WIDGETS_CREATED')
}

async function testWidgetsUpdatedEvent() {
	let shape1 = await rtb.board.widgets.shapes.create()
	let shape2 = await rtb.board.widgets.shapes.create({x: 50})
	let updatedWidgets = await getDataFromEvent(rtb.enums.event.WIDGETS_TRANSFORMATION_UPDATED, () => {
		rtb.board.transformDelta([shape1.id, shape2.id], 20)
	})
	assertEq(updatedWidgets.length, 2, 'updated two widgets')

	console.log('Done: WIDGETS_UPDATED')
}

async function testWidgetsDeletedEvent() {

	console.log('Done: WIDGETS_DELETED')
}

////////////////////////////////////////////////////////////////////////////////////
// HELPERS
////////////////////////////////////////////////////////////////////////////////////

async function clearBoard() {
	let allObjects = await rtb.board.getAllObjects()
	await rtb.board.deleteById(allObjects.map(o => o.id))
	allObjects = await rtb.board.getAllObjects()
	assertCondition(allObjects.length === 0, 'board should be empty')
}

function assertCondition(cond, message) {
	console.assert(cond, message)
}

function assertEq(value, expectedValue, message) {
	if (typeof value === 'object') {
		console.assert(isEquivalent(value, expectedValue), message, value, expectedValue)
	} else {
		console.assert(value === expectedValue, `'${value}' !== '${expectedValue}', ${message}`)
	}
}

function assertNotEq(value, expectedValue, message) {
	if (typeof value === 'object') {
		console.assert(!isEquivalent(value, expectedValue), message, value, expectedValue)
	} else {
		console.assert(value !== expectedValue, `'${value}' === '${expectedValue}', ${message}`)
	}
}

async function getDataFromEvent(eventType, action) {
	return new Promise((resolve, reject) => {
		let timeoutId = setTimeout(() => {
			reject(`${eventType} out of timeout`)
		}, 100)
		let handler = (e) => {
			clearTimeout(timeoutId)
			rtb.removeListener(eventType, handler)
			resolve(e.data)
		}
		rtb.addListener(eventType, handler)
		action()
	})
}

function isEquivalent(a, b) {
	return JSON.stringify(a) === JSON.stringify(b)
}