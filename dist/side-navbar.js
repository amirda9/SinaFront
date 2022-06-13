function createCookie(name, value, days) {
    if(days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        var expires = "; expires=" + date.toUTCString()
    } else var expires = "";
    document.cookie = name + "=" + value + expires + "; path=/"
}

function readCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while(c.charAt(0) == ' ') c = c.substring(1, c.length);
        if(c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length)
    }
    return null
}


$(document).on('click', '.side-close-icon', function() {
    setTimeout(function() {
        $('.side-open-icon').removeClass('strong-hidden').addClass('show');
    }, 250);
    if($('html').attr('data-dir') == 'ltr') $('.side-buttons').css('right', '-150px');
    else $('.side-buttons').css('left', '-150px');
    createCookie('side-buttons-hide', 'true', 7);
});
$(document).on('click', '.side-open-icon', function() {
    $('.side-open-icon').addClass('strong-hidden').removeClass('show');
    if($('html').attr('data-dir') == 'ltr') $('.side-buttons').css('right', '0');
    else $('.side-buttons').css('left', '0');
    document.cookie = 'side-buttons-hide=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
});
if(readCookie('side-buttons-hide')) {
    $('.side-open-icon').removeClass('strong-hidden').addClass('show');
    if($('html').attr('data-dir') == 'ltr') $('.side-buttons').css('right', '-150px');
    else $('.side-buttons').css('left', '-150px');
    setTimeout(function() {
        $('.side-buttons').removeClass('strong-hidden');
    }, 500);
} else {
    $('.side-buttons').removeClass('strong-hidden');
}