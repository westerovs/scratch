class Scratch {
  constructor() {
    this.canvas = document.getElementById('js-canvas')
    this.ctx = this.canvas.getContext('2d')
  
    this.brush = new Image()
    this.brush.src = './images/brush.png'
  
    this.isDrawing = null
    this.lastPoint = null
  }
  
  init = () => {
    const image = new Image()
    image.src = './images/cover.png'
    image.onload = () => {
      this.canvas.width = image.naturalWidth
      this.canvas.height = image.naturalHeight
      
      this.ctx.drawImage(image, 0, 0)
      document.querySelector('.form').style.visibility = 'visible'
  
      this.canvas.addEventListener('pointerdown', this.handlePointerDown)
      this.canvas.addEventListener('pointermove', this.handlePointerMove)
      this.canvas.addEventListener('pointerup', this.handlePointerUp)
    }
  }
  
  // ------------ POINTERS -----------------
  getPointer = (e, canvas) => {
    let offsetX = 0
    let offsetY = 0
    let mx = null
    let my = null
    
    if (canvas.offsetParent !== undefined) {
      do {
        offsetX += canvas.offsetLeft
        offsetY += canvas.offsetTop
      } while ((canvas = canvas.offsetParent))
    }
    
    mx = (e.pageX || e.touches[0].clientX) - offsetX
    my = (e.pageY || e.touches[0].clientY) - offsetY
    
    return {x: mx, y: my}
  }
  
  handlePointerDown = (e) => {
    this.isDrawing = true
    this.lastPoint = this.getPointer(e, this.canvas)
  }
  
  handlePointerMove = (e) => {
    if (!this.isDrawing) return
    e.preventDefault()
    
    const currentPoint = this.getPointer(e, this.canvas)
    const dist = this.distanceBetween(this.lastPoint, currentPoint)
    const angle = this.angleBetween(this.lastPoint, currentPoint)
    let x = null
    let y = null
    
    for (let i = 0; i < dist; i++) {
      x = this.lastPoint.x + (Math.sin(angle) * i) - 25
      y = this.lastPoint.y + (Math.cos(angle) * i) - 25
      this.ctx.globalCompositeOperation = 'destination-out' // делает прозрачным очищенную область
      this.ctx.drawImage(this.brush, x, y)
    }
    
    this.checkWin(currentPoint)
  }
  
  handlePointerUp = () => {
    this.isDrawing = false
  }
  // --------------------------------------
  
  // вычисляет длину захвата
  distanceBetween = (point1, point2) => {
    return Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2))
  }
  
  // вычисляет угол от -2 до 2
  angleBetween = (point1, point2) => {
    return Math.atan2(point2.x - point1.x, point2.y - point1.y)
  }
  
  checkWin = (currentPoint) => {
    this.lastPoint = currentPoint
    
    const percentFindPixels = this.getFilledInPixels(50)
  
    console.log(`cleared: ${percentFindPixels}%`)
    if (percentFindPixels > 50) this.canvas.remove()
  }
  
  // Only test every `stride` pixel. `stride`x faster,
  // but might lead to inaccuracy
  getFilledInPixels = (stride) => {
    if (!stride || stride < 1) stride = 1
    
    const pixels = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height)
    const pixelData = pixels.data
    const pixelDataLength = pixelData.length
    const total = (pixelDataLength / stride)
    
    let counter = 0
    
    // Iterate over all pixels
    for (let i = 0; i < pixelDataLength; i += stride) {
      if (parseInt(pixelData[i]) === 0) {
        counter++
      }
    }
    
    return Math.round((counter / total) * 100)
  }
}

new Scratch().init()
