import '../css/home.css'


(function() {
    var imageNumber = 1;
    var MAX_IMG_NUMBER = 3;
    var MIN_IMG_NUMBER = 1
    var $heroImage = document.querySelector('.hero-image');
    var $arrowRight = document.querySelector('.arrow-right');
    var $leftArrow = document.querySelector('.arrow-left');

    var canClick = true;

    $arrowRight.onclick = function() {
        if (canClick === false) {
            return;
        }
        canClick = false;
        imageNumber += 1;
        if (imageNumber > MAX_IMG_NUMBER) {
            imageNumber = MIN_IMG_NUMBER;
        }
        
        changeHeroImage(imageNumber, function() {
            canClick = true;
        });
    }

    $leftArrow.onclick = function() {
        if (canClick === false) {
            return;
        }
        canClick = false;
        imageNumber -= 1;
        if (imageNumber < MIN_IMG_NUMBER) {
            imageNumber = MAX_IMG_NUMBER;
        }
        
        changeHeroImage(imageNumber, function() {
            canClick = true;
        });
    }

    function changeHeroImage(imageNumber, callback) {
        var classNames = $heroImage.className.split(' ')
        .filter(function(name) {
            return name.indexOf('room-') === -1;
        });
        
        if (classNames.indexOf('fade-in') === -1) {
            classNames.push('fade-in');
        }
        
        classNames.push('room-' + imageNumber);
        document.querySelector('.hero-image').style.opacity = 0;

        setTimeout(function() {
            $heroImage.className  = classNames.join(' ');
            document.querySelector('.hero-image').style.opacity = 1;
            callback();
        }, 500);
    }   



}());