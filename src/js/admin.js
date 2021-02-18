/* globals i18n */
$(function () {
    $('#reset-btn').on('click', function (e) {
        e.preventDefault();
        const msg = i18n('really_delete');
        const really = confirm(msg);
        const data = {type: 'reset'};
        const elem = $(this);
        elem.addClass('saving');
        if (really) {
            $.ajax({
                url: '../api/admin.php',
                data: data,
                dataType: 'json',
                type: 'post',
                success: function (resp) {
                    elem.removeClass('saving');
                    elem.addClass(resp);

                    setTimeout(function () {
                        elem.removeClass('error success');

                        window.location.reload();
                    }, 3000);
                }
            });
        } else {
            elem.removeClass('saving');
        }
    });

    $('#save-btn').on('click', function (e) {
        e.preventDefault();
        const elem = $(this);
        elem.addClass('saving');
        const data = 'type=config&' + $('form').serialize();
        $.ajax({
            url: '../api/admin.php',
            data: data,
            dataType: 'json',
            type: 'post',
            success: function (resp) {
                elem.removeClass('saving');
                elem.addClass(resp);

                setTimeout(function () {
                    elem.removeClass('error success');

                    if (resp === 'success') {
                        window.location.reload();
                    }
                }, 2000);
            }
        });
    });

    $('#diskusage-btn').on('click', function (e) {
        e.preventDefault();
        location.assign('diskusage.php');

        return false;
    });

    $('#checkVersion a').on('click', function (ev) {
        ev.preventDefault();

        $(this).html('<i class="fa fa-circle-o-notch fa-spin fa-fw"></i>');

        $.ajax({
            url: '../api/checkVersion.php',
            method: 'GET',
            success: (data) => {
                let message = 'Error';
                $('#checkVersion').empty();
                console.log('data', data);
                if (!data.updateAvailable) {
                    message = i18n('using_latest_version');
                } else if (/^\d+\.\d+\.\d+$/u.test(data.availableVersion)) {
                    message = i18n('update_available');
                } else {
                    message = i18n('test_update_available');
                }

                const textElement = $('<p>');
                textElement.text(message);
                textElement.append('<br />');
                textElement.append(i18n('current_version') + ': ');
                textElement.append(data.currentVersion);
                textElement.append('<br />');
                textElement.append(i18n('available_version') + ': ');
                textElement.append(data.availableVersion);
                textElement.appendTo('#checkVersion');
            }
        });
    });

    // Admin Panel active section at init
    $('#nav-general').addClass('active');

    /*
     * Check if element is visible in current viewport on screen
     * https://www.javascripttutorial.net/dom/css/check-if-an-element-is-visible-in-the-viewport
     */
    function isInViewport(element) {
        const rect = element.getBoundingClientRect();

        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    // Range slider - dynamically update value when being moved
    $(document).on('input', '.configslider', function () {
        document.querySelector(
            '#' + this.name.replace('[', '\\[').replace(']', '\\]') + '-value span'
        ).innerHTML = this.value;
    });

    /*
     * Install waypoints for each section, to enable dynamic nav bar
     * FIXME - trigger waypoints for settings at bottom of screen (those WPs never trigger automatically)
     */
    $('.setting_section').waypoint({
        handler: function (direction) {
            $('.adminnavlistelement').removeClass('active');
            $('#nav-' + this.element.id).addClass('active');

            const contentpage = document.getElementById('adminsidebar');
            const elemTarget = document.getElementById('nav-' + this.element.id);

            if (!isInViewport(elemTarget)) {
                const topPos = elemTarget.offsetTop;
                let newPos = 0;

                if (direction == 'down') {
                    newPos = topPos + elemTarget.offsetHeight - window.innerHeight;
                } else {
                    newPos = topPos;
                }
                contentpage.scrollTop = newPos;
            }
        }
    });

    // Click on nav bar element scrolls settings content page
    $('.adminnavlistelement').click(function (e) {
        e.preventDefault();

        // on small screens, hide navbar after click
        if (window.matchMedia('screen and (max-width: 700px)').matches) {
            $('div.adminsidebar').toggle();
        }

        const target = $(this).attr('href');

        // scroll content page if we need to
        const contentpage = document.getElementById('admincontentpage');
        const elemTarget = document.getElementById(target.substring(1));

        const totalPageHeight = contentpage.scrollHeight;
        const scrollPoint = window.scrollY + window.innerHeight;

        if (isInViewport(elemTarget) && scrollPoint >= totalPageHeight) {
            $('.adminnavlistelement').removeClass('active');
            $('#' + this.id).addClass('active');

            return false;
        }

        $('html, body').animate(
            {
                // sroll element to 5em below top - and have to disable eslint rule because prettier removes unnecessary but clarifying parenthesis
                // eslint-disable-next-line no-mixed-operators
                scrollTop: $(target).offset().top - 5 * parseInt(config.ui.font_size, 10)
            },
            1000,
            () => {
                $('.adminnavlistelement').removeClass('active');
                $('#' + this.id).addClass('active');

                // scroll nav bar if needed
                const cp = document.getElementById('adminsidebar');
                const eT = document.getElementById(this.id);

                if (!isInViewport(eT)) {
                    const viewportOffset = elemTarget.getBoundingClientRect();
                    let newPos = 0;

                    if (viewportOffset.top < 0) {
                        newPos = eT.offsetTop;
                    } else {
                        newPos = window.innerHeight - eT.offsetHeight;
                    }
                    cp.scrollTop = newPos;
                }

                return false;
            }
        );

        return false;
    });

    // Localization of toggle button text
    $('.toggle').click(function () {
        if ($('input', this).is(':checked')) {
            $('.toggleTextON', this).removeClass('hidden');
            $('.toggleTextOFF', this).addClass('hidden');
        } else {
            $('.toggleTextOFF', this).removeClass('hidden');
            $('.toggleTextON', this).addClass('hidden');
        }
    });

    // activate selectize library for multi-selects
    $('.multi-select').selectize({});

    // menu toggle button for topnavbar (small screen sizes)
    $('#admintopnavbarmenutoggle').on('click', function () {
        $('.adminsidebar').toggle();
        if (window.matchMedia('screen and (min-width: 701px)').matches) {
            if ($('#adminsidebar').is(':visible')) {
                $('#admincontentpage').css('margin-left', '200px');
            } else {
                $('#admincontentpage').css('margin-left', '0px');
            }
        }
    });

    // back  button for topnavbar (small screen sizes)
    $('#admintopnavbarback').on('click', function () {
        location.assign('../');
    });

    // logout button for topnavbar (small screen sizes)
    $('#admintopnavbarlogout').on('click', function () {
        location.assign('../login/logout.php');
    });

    // check padding of settings content on window resize
    window.addEventListener('resize', onWindowResize);
    function onWindowResize() {
        if (window.matchMedia('screen and (max-width: 700px)').matches) {
            $('#admincontentpage').css('margin-left', '0px');
        } else if ($('#adminsidebar').is(':visible')) {
            $('#admincontentpage').css('margin-left', '200px');
        }
    }
});
