rtb.onReady(() => {
  rtb.initialize({
    onStart: function () {
      console.log('Shaker: onStart()')
    },
    extensionPoints: {
      bottomBar: {
        title: 'Shake me baby',
        svgIcon: '',
        positionPriority: 2,
        onClick: function () {
          function animate() {
            zoomIn().then(zoomOut).then(animate)
          }

          animate()
        }
      }
    }
  })
})

function zoomIn() {
  return rtb.board.viewport.setZoom(0.5)
}

function zoomOut() {
  return rtb.board.viewport.setZoom(4)
}