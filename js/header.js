// Ждем загрузки DOM
document.addEventListener('DOMContentLoaded', function() {
    const header = document.getElementById('header');
    let lastScrollTop = 0; // последняя позиция скролла
    let isHeaderVisible = true; // виден ли хедер
    let hideTimeout; // таймер для скрытия
    let isNearTop = false; // находится ли курсор у верхнего края
    
    // Порог для срабатывания (в пикселях от верхнего края)
    const TOP_THRESHOLD = 64;
    
    // Функция показа хедера
    function showHeader() {
        header.style.transform = 'translate(-50%, 0)';
        isHeaderVisible = true;
    }
    
    // Функция скрытия хедера
    function hideHeader() {
        header.style.transform = 'translate(-50%, -100px)';
        isHeaderVisible = false;
    }
    
    // Обработчик скролла
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Определяем направление скролла
        if (scrollTop > lastScrollTop) {
            // Скролл вниз
            if (isHeaderVisible && !isNearTop) {
                hideHeader();
            }
        } else {
            // Скролл вверх
            if (!isHeaderVisible) {
                showHeader();
            }
        }
        
        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop; // Для мобильных устройств
    });
    
    // Обработчик движения мыши
    document.addEventListener('mousemove', function(e) {
        const mouseY = e.clientY; // Y координата курсора
        
        // Проверяем, находится ли курсор в верхней зоне
        if (mouseY <= TOP_THRESHOLD) {
            isNearTop = true;
            
            // Показываем хедер, если он скрыт
            if (!isHeaderVisible) {
                showHeader();
            }
            
            // Сбрасываем таймер скрытия
            if (hideTimeout) {
                clearTimeout(hideTimeout);
            }
        } else {
            isNearTop = false;
            
            // Если курсор ушел из верхней зоны, планируем скрытие
            if (isHeaderVisible && lastScrollTop > 50) { // Не скрываем, если мы в самом верху
                if (hideTimeout) {
                    clearTimeout(hideTimeout);
                }
                
                hideTimeout = setTimeout(function() {
                    // Проверяем, не вернулся ли курсор наверх за время таймера
                    if (!isNearTop && lastScrollTop > 50) {
                        hideHeader();
                    }
                }, 300); // Задержка перед скрытием
            }
        }
    });
    
    // При уходе мыши с окна
    document.addEventListener('mouseleave', function() {
        isNearTop = false;
        
        // Если мы не в самом верху страницы, скрываем хедер
        if (lastScrollTop > 50 && isHeaderVisible) {
            hideHeader();
        }
    });
    
    // При входе мыши в окно
    document.addEventListener('mouseenter', function(e) {
        // Проверяем позицию мыши при входе
        if (e.clientY <= TOP_THRESHOLD) {
            isNearTop = true;
            if (!isHeaderVisible) {
                showHeader();
            }
        }
    });
    
    // Показываем хедер при достижении верха страницы
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop < 50 && !isHeaderVisible) {
            showHeader();
        }
    });
});

// Добавляем плавный переход в CSS для хедера