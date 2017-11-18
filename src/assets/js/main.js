import '../css/main.css';


(function() {
    var $userIcon = document.querySelector('.user-icon');

    function setActiveNavLinkColor() {
        var path = window.location.pathname;
        var el = document.querySelector('li a[href="' + path + '"]');
        if (el) {
	        el.className += " active-link";
        }
    }

    setActiveNavLinkColor();
}());