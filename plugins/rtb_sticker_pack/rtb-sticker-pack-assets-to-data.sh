#!/bin/bash

echo "["

ASSETS=./img/*.svg
for f in ${ASSETS}
do
  #f2=${f// /_}
  #mv "${f}" "${f2}"
  #f=${f2}

  CONTENT=$(cat "${f}")
  if [[ ${CONTENT} =~ (viewBox=\"0 0 ([0-9\.]*) ([0-9\.]*)\") ]]; then
    WIDTH=${BASH_REMATCH[2]}
    HEIGHT=${BASH_REMATCH[3]}
    echo -e "\t{src: '${f:2}', width: ${WIDTH}, height: ${HEIGHT}},"
  fi

done

echo "]"