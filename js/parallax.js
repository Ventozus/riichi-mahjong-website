document.addEventListener('mousemove', (e) => {
    const containers = document.querySelectorAll('.parallax-container')
    
    containers.forEach(container => {
        const layers = container.querySelectorAll('.layer')
        
        layers.forEach(layer => {
            const speed = parseFloat(layer.getAttribute('data-speed')) || 0.5
            
            // Вычисляем позицию мыши относительно центра
            const x = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2)
            const y = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2)
            
            // Применяем трансформацию
            const moveX = x * 50 * speed
            const moveY = y * 50 * speed
            
            layer.style.transform = `translate(${moveX}px, ${moveY}px)`
        })
    })
})