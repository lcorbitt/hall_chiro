/**
 * Global variables
 */
"use strict";

var userAgent = navigator.userAgent.toLowerCase(),
	initialDate = new Date(),

	$document = $(document),
	$window = $(window),
	$html = $("html"),

	isDesktop = $html.hasClass("desktop"),
	isIE = userAgent.indexOf("msie") != -1 ? parseInt(userAgent.split("msie")[1]) : userAgent.indexOf("trident") != -1 ? 11 : userAgent.indexOf("edge") != -1 ? 12 : false,
	isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
	isTouch = "ontouchstart" in window,
	onloadCaptchaCallback,

	plugins = {
		pointerEvents: isIE < 11 ? "js/pointer-events.min.js" : false,
		bootstrapTabs: $(".tabs"),
		materialParallax: $(".parallax-container"),
		rdVideoPlayer: $(".rd-video-player"),
		responsiveTabs: $(".responsive-tabs"),
		maps: $(".google-map-container"),
		rdInputLabel: $(".form-label"),
		rdNavbar: $(".rd-navbar"),
		rdVideoBG: $(".rd-video"),
		regula: $("[data-constraints]"),
		stepper: $("input[type='number']"),
		radio: $("input[type='radio']"),
		checkbox: $(".checkbox-custom"),
		counter: $(".counter"),
		circleProgress: $(".progress-bar-circle"),
		dateCountdown: $('.DateCountdown'),
		toggles: $(".toggle-custom"),
		owl: $(".owl-carousel"),
		swiper: $(".swiper-slider"),
		lightGallery: $("[data-lightgallery='group']"),
		lightGalleryItem: $("[data-lightgallery='item']"),
		lightDynamicGalleryItem: $("[data-lightgallery='dynamic']"),
		progressBar: $(".progress-linear"),
		isotope: $(".isotope"),
		stacktable: $("table[data-responsive='true']"),
		customToggle: $("[data-custom-toggle]"),
		customWaypoints: $('[data-custom-scroll-to]'),
		selectFilter: $("select"),
		calendar: $(".rd-calendar"),
		pageLoader: $(".page-loader"),
		search: $(".rd-search"),
		searchResults: $('.rd-search-results'),
		rdMailForm: $(".rd-mailform"),
		iframeEmbed: $("iframe.embed-responsive-item"),
		bootstrapDateTimePicker: $("[data-time-picker]"),
		checkoutRDTabs: $(".checkout-tabs"),
		facebookplugin: $('#fb-root'),
		captcha: $('.recaptcha'),
		fullCalendar: $("#calendar")
	};

/**
 * Initialize All Scripts
 */
$document.ready(function () {
	var isNoviBuilder = window.xMode;

	/**
	 * isScrolledIntoView
	 * @description  check the element whas been scrolled into the view
	 */
	function isScrolledIntoView(elem) {
		var $window = $(window);
		return elem.offset().top + elem.outerHeight() >= $window.scrollTop() && elem.offset().top <= $window.scrollTop() + $window.height();
	}

	/**
	 * initOnView
	 * @description  calls a function when element has been scrolled into the view
	 */
	function lazyInit(element, func) {
		var $win = jQuery(window);
		$win.on('load scroll', function () {
			if ((!element.hasClass('lazy-loaded') && (isScrolledIntoView(element)))) {
				func.call(element);
				element.addClass('lazy-loaded');
			}
		});
	}

	/**
	 * getSwiperHeight
	 * @description  calculate the height of swiper slider basing on data attr
	 */
	function getSwiperHeight(object, attr) {
		var val = object.attr("data-" + attr),
			dim;
		if (!val) {
			return undefined;
		}

		dim = val.match(/(px)|(%)|(vh)$/i);

		if (dim.length) {
			switch (dim[0]) {
				case "px":
					return parseFloat(val);
				case "vh":
					return $(window).height() * (parseFloat(val) / 100);
				case "%":
					return object.width() * (parseFloat(val) / 100);
			}
		} else {
			return undefined;
		}
	}

	/**
	 * toggleSwiperInnerVideos
	 * @description  toggle swiper videos on active slides
	 // */
	function toggleSwiperInnerVideos(swiper) {
		var videos;

		$.grep(swiper.slides, function (element, index) {
			var $slide = $(element),
				video;

			if (index === swiper.activeIndex) {
				videos = $slide.find("video");
				if (videos.length) {
					videos.get(0).play();
				}
			} else {
				$slide.find("video").each(function () {
					this.pause();
				});
			}
		});
	}

	/**
	 * toggleSwiperCaptionAnimation
	 * @description  toggle swiper animations on active slides
	 */
	function toggleSwiperCaptionAnimation(swiper) {
		if (isIE && isIE < 10) {
			return;
		}

		var prevSlide = $(swiper.container),
			nextSlide = $(swiper.slides[swiper.activeIndex]);

		prevSlide
			.find("[data-caption-animate]")
			.each(function () {
				var $this = $(this);
				$this
					.removeClass("animated")
					.removeClass($this.attr("data-caption-animate"))
					.addClass("not-animated");
			});

		nextSlide
			.find("[data-caption-animate]")
			.each(function () {
				var $this = $(this),
					delay = $this.attr("data-caption-delay");

				setTimeout(function () {
					$this
						.removeClass("not-animated")
						.addClass($this.attr("data-caption-animate"))
						.addClass("animated");
				}, delay ? parseInt(delay) : 0);
			});
	}

	/**
	 * Google map function for getting latitude and longitude
	 */
	function getLatLngObject(str, marker, map, callback) {
		var coordinates = {};
		try {
			coordinates = JSON.parse(str);
			callback(new google.maps.LatLng(
				coordinates.lat,
				coordinates.lng
			), marker, map)
		} catch (e) {
			map.geocoder.geocode({'address': str}, function (results, status) {
				if (status === google.maps.GeocoderStatus.OK) {
					var latitude = results[0].geometry.location.lat();
					var longitude = results[0].geometry.location.lng();

					callback(new google.maps.LatLng(
						parseFloat(latitude),
						parseFloat(longitude)
					), marker, map)
				}
			})
		}
	}

	/**
	 * Live Search
	 * @description  create live search results
	 */
	function liveSearch(options) {
		$('#' + options.live).removeClass('cleared').html();
		options.current++;
		options.spin.addClass('loading');
		$.get(handler, {
			s: decodeURI(options.term),
			liveSearch: options.live,
			dataType: "html",
			liveCount: options.liveCount,
			filter: options.filter,
			template: options.template
		}, function (data) {
			options.processed++;
			var live = $('#' + options.live);
			if (options.processed == options.current && !live.hasClass('cleared')) {
				live.find('> #search-results').removeClass('active');
				live.html(data);
				setTimeout(function () {
					live.find('> #search-results').addClass('active');
				}, 50);
			}
			options.spin.parents('.rd-search').find('.input-group-addon').removeClass('loading');
		})
	}

	/**
	 * attachFormValidator
	 * @description  attach form validation to elements
	 */
	function attachFormValidator(elements) {
		for (var i = 0; i < elements.length; i++) {
			var o = $(elements[i]), v;
			o.addClass("form-control-has-validation").after("<span class='form-validation'></span>");
			v = o.parent().find(".form-validation");
			if (v.is(":last-child")) {
				o.addClass("form-control-last-child");
			}
		}

		elements
			.on('input change propertychange blur', function (e) {
				var $this = $(this), results;

				if (e.type != "blur") {
					if (!$this.parent().hasClass("has-error")) {
						return;
					}
				}

				if ($this.parents('.rd-mailform').hasClass('success')) {
					return;
				}

				if ((results = $this.regula('validate')).length) {
					for (i = 0; i < results.length; i++) {
						$this.siblings(".form-validation").text(results[i].message).parent().addClass("has-error")
					}
				} else {
					$this.siblings(".form-validation").text("").parent().removeClass("has-error")
				}
			})
			.regula('bind');
	}

	/**
	 * isValidated
	 * @description  check if all elemnts pass validation
	 */
	function isValidated(elements, captcha) {
		var results, errors = 0;

		if (elements.length) {
			for (j = 0; j < elements.length; j++) {

				var $input = $(elements[j]);
				if ((results = $input.regula('validate')).length) {
					for (k = 0; k < results.length; k++) {
						errors++;
						$input.siblings(".form-validation").text(results[k].message).parent().addClass("has-error");
					}
				} else {
					$input.siblings(".form-validation").text("").parent().removeClass("has-error")
				}
			}

			if (captcha) {
				if (captcha.length) {
					return validateReCaptcha(captcha) && errors == 0
				}
			}

			return errors == 0;
		}
		return true;
	}

	/**
	 * validateReCaptcha
	 * @description  validate google reCaptcha
	 */
	function validateReCaptcha(captcha) {
		var $captchaToken = captcha.find('.g-recaptcha-response').val();

		if ($captchaToken == '') {
			captcha
				.siblings('.form-validation')
				.html('Please, prove that you are not robot.')
				.addClass('active');
			captcha
				.closest('.form-group')
				.addClass('has-error');

			captcha.bind('propertychange', function () {
				var $this = $(this),
					$captchaToken = $this.find('.g-recaptcha-response').val();

				if ($captchaToken != '') {
					$this
						.closest('.form-group')
						.removeClass('has-error');
					$this
						.siblings('.form-validation')
						.removeClass('active')
						.html('');
					$this.unbind('propertychange');
				}
			});

			return false;
		}

		return true;
	}

	/**
	 * onloadCaptchaCallback
	 * @description  init google reCaptcha
	 */
	onloadCaptchaCallback = function () {
		for (i = 0; i < plugins.captcha.length; i++) {
			var $capthcaItem = $(plugins.captcha[i]);

			grecaptcha.render(
				$capthcaItem.attr('id'),
				{
					sitekey: $capthcaItem.attr('data-sitekey'),
					size: $capthcaItem.attr('data-size') ? $capthcaItem.attr('data-size') : 'normal',
					theme: $capthcaItem.attr('data-theme') ? $capthcaItem.attr('data-theme') : 'light',
					callback: function (e) {
						$('.recaptcha').trigger('propertychange');
					}
				}
			);
			$capthcaItem.after("<span class='form-validation'></span>");
		}
	}

	/**
	 * makeUniqueRandom
	 * @description  make random for gallery tabs
	 */
	function makeUniqueRandom(count) {
		if (!uniqueRandoms.length) {
			for (var i = 0; i < count; i++) {
				uniqueRandoms.push(i);
			}
		}
		var index = Math.floor(Math.random() * uniqueRandoms.length);
		var val = uniqueRandoms[index];
		uniqueRandoms.splice(index, 1);
		return val;
	}

	/**
	 * makeVisible
	 * @description  set class to gallery tabs to make it visible
	 */
	function makeVisible(el) {
		var count = el.length,
			k = 0,
			step = 2.5;
		for (var i = 0; i < count; i++) {
			timer = setTimeout(function () {
				var rand = makeUniqueRandom(count);
				el.eq(rand).addClass('visible');
			}, k * 35);
			k += step;
		}
		timer2 = setTimeout(function () {
			el.not('.visible').addClass('visible');
		}, count * step * 35)
	}

	/**
	 * makeInVisible
	 * @description  set class to gallery tabs to make it invisible
	 */
	function makeInvisible() {
		var el = $('.image.visible');
		el.removeClass('visible');
		uniqueRandoms = [];
		clearTimeout(timer);
		clearTimeout(timer2);
	}

	/**
	 * initOwlCarousel
	 * @description  Init owl carousel plugin
	 */
	function initOwlCarousel(c) {
		var aliaces = ["-", "-xs-", "-sm-", "-md-", "-lg-"],
			values = [0, 480, 768, 992, 1200],
			responsive = {},
			j, k;

		for (j = 0; j < values.length; j++) {
			responsive[values[j]] = {};
			for (k = j; k >= -1; k--) {
				if (!responsive[values[j]]["items"] && c.attr("data" + aliaces[k] + "items")) {
					responsive[values[j]]["items"] = k < 0 ? 1 : parseInt(c.attr("data" + aliaces[k] + "items"), 10);
				}
				if (!responsive[values[j]]["stagePadding"] && responsive[values[j]]["stagePadding"] !== 0 && c.attr("data" + aliaces[k] + "stage-padding")) {
					responsive[values[j]]["stagePadding"] = k < 0 ? 0 : parseInt(c.attr("data" + aliaces[k] + "stage-padding"), 10);
				}
				if (!responsive[values[j]]["margin"] && responsive[values[j]]["margin"] !== 0 && c.attr("data" + aliaces[k] + "margin")) {
					responsive[values[j]]["margin"] = k < 0 ? 30 : parseInt(c.attr("data" + aliaces[k] + "margin"), 10);
				}
			}
		}

		// Enable custom pagination
		if (c.attr('data-dots-custom')) {
			c.on("initialized.owl.carousel", function (event) {
				var carousel = $(event.currentTarget),
					customPag = $(carousel.attr("data-dots-custom")),
					active = 0;

				if (carousel.attr('data-active')) {
					active = parseInt(carousel.attr('data-active'), 10);
				}

				carousel.trigger('to.owl.carousel', [active, 300, true]);
				customPag.find("[data-owl-item='" + active + "']").addClass("active");

				customPag.find("[data-owl-item]").on('click', function (e) {
					e.preventDefault();
					carousel.trigger('to.owl.carousel', [parseInt(this.getAttribute("data-owl-item"), 10), 300, true]);
				});

				carousel.on("translate.owl.carousel", function (event) {
					customPag.find(".active").removeClass("active");
					customPag.find("[data-owl-item='" + event.item.index + "']").addClass("active")
				});
			});
		}

		c.owlCarousel({
			autoplay: isNoviBuilder ? false: c.attr("data-autoplay") === "true",
			loop: isNoviBuilder ? false : c.attr("data-loop") !== "false",
			items: 1,
			dotsContainer: c.attr("data-pagination-class") || false,
			navContainer: c.attr("data-navigation-class") || false,
			mouseDrag: isNoviBuilder ? false : c.attr("data-mouse-drag") !== "false",
			nav: c.attr("data-nav") === "true",
			dots: ( isNoviBuilder && c.attr("data-nav") !== "true" ) ? true : c.attr("data-dots") === "true",
			dotsEach: c.attr("data-dots-each") ? parseInt(c.attr("data-dots-each"), 10) : false,
			animateIn: c.attr('data-animation-in') ? c.attr('data-animation-in') : false,
			animateOut: c.attr('data-animation-out') ? c.attr('data-animation-out') : false,
			responsive: responsive,
			navText: $.parseJSON(c.attr("data-nav-text")) || [],
			navClass: $.parseJSON(c.attr("data-nav-class")) || ['owl-prev', 'owl-next']
		});
	}

	/**
	 * lightGallery
	 * @description Enables lightGallery plugin
	 */
	function initLightGallery(itemsToInit, addClass) {
		if (!isNoviBuilder) {
			$(itemsToInit).lightGallery({
				thumbnail: $(itemsToInit).attr("data-lg-thumbnail") !== "false",
				selector: "[data-lightgallery='item']",
				autoplay: $(itemsToInit).attr("data-lg-autoplay") === "true",
				pause: parseInt($(itemsToInit).attr("data-lg-autoplay-delay")) || 5000,
				addClass: addClass,
				mode: $(itemsToInit).attr("data-lg-animation") || "lg-slide",
				loop: $(itemsToInit).attr("data-lg-loop") !== "false"
			});
		}
	}

	function initDynamicLightGallery(itemsToInit, addClass) {
		if (!isNoviBuilder) {
			$(itemsToInit).on("click", function() {
				$(itemsToInit).lightGallery({
					thumbnail: $(itemsToInit).attr("data-lg-thumbnail") !== "false",
					selector: "[data-lightgallery='item']",
					autoplay: $(itemsToInit).attr("data-lg-autoplay") === "true",
					pause: parseInt($(itemsToInit).attr("data-lg-autoplay-delay")) || 5000,
					addClass: addClass,
					mode: $(itemsToInit).attr("data-lg-animation") || "lg-slide",
					loop: $(itemsToInit).attr("data-lg-loop") !== "false",
					dynamic: true,
					dynamicEl:
					JSON.parse($(itemsToInit).attr("data-lg-dynamic-elements")) || []
				});
			});
		}
	}

	function initLightGalleryItem(itemToInit, addClass) {
		if (!isNoviBuilder) {
			$(itemToInit).lightGallery({
				selector: "this",
				addClass: addClass,
				counter: false,
				youtubePlayerParams: {
					modestbranding: 1,
					showinfo: 0,
					rel: 0,
					controls: 0
				},
				vimeoPlayerParams: {
					byline: 0,
					portrait: 0
				}
			});
		}
	}

	/**
	 * IE Polyfills
	 * @description  Adds some loosing functionality to IE browsers
	 */
	if (isIE) {
		if (isIE < 10) {
			$html.addClass("lt-ie-10");
		}

		if (isIE < 11) {
			if (plugins.pointerEvents) {
				$.getScript(plugins.pointerEvents)
					.done(function () {
						$html.addClass("ie-10");
						PointerEventsPolyfill.initialize({});
					});
			}
		}

		if (isIE === 11) {
			$("html").addClass("ie-11");
		}

		if (isIE === 12) {
			$("html").addClass("ie-edge");
		}
	}

	/**
	 * Swiper 3.1.7
	 * @description  Enable Swiper Slider
	 */
	if (plugins.swiper.length) {
		plugins.swiper.each(function () {
			var s = $(this);

			var pag = s.find(".swiper-pagination"),
				next = s.find(".swiper-button-next"),
				prev = s.find(".swiper-button-prev"),
				bar = s.find(".swiper-scrollbar"),
				h = getSwiperHeight(plugins.swiper, "height"), mh = getSwiperHeight(plugins.swiper, "min-height"),
				parallax = s.parents('.rd-parallax').length;

			s.find(".swiper-slide")
				.each(function () {
					var $this = $(this),
						url;

					if (url = $this.attr("data-slide-bg")) {
						$this.css({
							"background-image": "url(" + url + ")",
							"background-size": "cover"
						})
					}

				})
				.end()
				.find("[data-caption-animate]")
				.addClass("not-animated")
				.end()
				.swiper({
					autoplay: s.attr('data-autoplay') === "true" ? 5000 : false,
					direction: s.attr('data-direction') ? s.attr('data-direction') : "horizontal",
					effect: s.attr('data-slide-effect') ? s.attr('data-slide-effect') : "slide",
					speed: s.attr('data-slide-speed') ? s.attr('data-slide-speed') : 400,
					keyboardControl: s.attr('data-keyboard') === "true",
					mousewheelControl: s.attr('data-mousewheel') === "true",
					mousewheelReleaseOnEdges: s.attr('data-mousewheel-release') === "true",
					nextButton: next.length ? next.get(0) : null,
					prevButton: prev.length ? prev.get(0) : null,
					pagination: pag.length ? pag.get(0) : null,
					paginationClickable: pag.length ? pag.attr("data-clickable") !== "false" : false,
					paginationBulletRender: pag.length ? pag.attr("data-index-bullet") === "true" ? function (index, className) {
						return '<span class="' + className + '">' + (index + 1) + '</span>';
					} : null : null,
					scrollbar: bar.length ? bar.get(0) : null,
					scrollbarDraggable: bar.length ? bar.attr("data-draggable") !== "false" : true,
					scrollbarHide: bar.length ? bar.attr("data-draggable") === "false" : false,
					loop: isNoviBuilder ? false : s.attr('data-loop') !== "false",
					simulateTouch: s.attr('data-simulate-touch') && !isNoviBuilder ? s.attr('data-simulate-touch') === "true" : false,
					loopAdditionalSlides: 0,
					loopedSlides: 0,
					onTransitionStart: function (swiper) {
						toggleSwiperInnerVideos(swiper);
					},
					onTransitionEnd: function (swiper) {
						toggleSwiperCaptionAnimation(swiper);
						$(window).trigger("resize");
					},

					onInit: function (swiper) {
						if (plugins.pageLoader.length) {
							var srcFirst = $("#page-loader").attr("data-slide-bg"),
								image = document.createElement('img');

							image.src = srcFirst;
							image.onload = function () {
								plugins.pageLoader.addClass("loaded");
							};
						}
						toggleSwiperInnerVideos(swiper);
						toggleSwiperCaptionAnimation(swiper);

						// Create parallax effect on swiper caption
						s.find(".swiper-parallax")
							.each(function () {
								var $this = $(this),
									speed;

								if (parallax && !isIE && !isMobile) {
									if (speed = $this.attr("data-speed")) {
										makeParallax($this, speed, s, false);
									}
								}
							});
						$(window).on('resize', function () {
							setTimeout(function () {
								swiper.update(true);
							}, 200);

						})
					},
					onSlideChangeStart: function (swiper) {
						var activeSlideIndex, slidesCount, thumbsToShow = 3;

						activeSlideIndex = swiper.activeIndex;
						slidesCount = swiper.slides.not(".swiper-slide-duplicate").length;

						//If there is not enough slides
						if (slidesCount < thumbsToShow)
							return false;

						//Fix index count
						if (activeSlideIndex === slidesCount + 1) {
							activeSlideIndex = 1;
						} else if (activeSlideIndex === 0) {
							activeSlideIndex = slidesCount;
						}

						//Lopp that adds background to thumbs
						for (var i = -thumbsToShow; i < thumbsToShow + 1; i++) {
							if (i === 0)
								continue;

							//Previous btn thumbs
							if (i < 0) {
								//If there is no slides before current
								if (( activeSlideIndex + i - 1) < 0) {
									$(swiper.container).find('.swiper-button-prev .preview__img-' + Math.abs(i))
										.css("background-image", "url(" + swiper.slides[slidesCount + i + 1].getAttribute("data-preview-bg") + ")");
								} else {
									$(swiper.container).find('.swiper-button-prev .preview__img-' + Math.abs(i))
										.css("background-image", "url(" + swiper.slides[activeSlideIndex + i].getAttribute("data-preview-bg") + ")");
								}

								//Next btn thumbs
							} else {
								//If there is no slides after current
								if (activeSlideIndex + i - 1 > slidesCount) {
									$(swiper.container).find('.swiper-button-next .preview__img-' + i)
										.css("background-image", "url(" + swiper.slides[i].getAttribute("data-preview-bg") + ")");
								} else {
									$(swiper.container).find('.swiper-button-next .preview__img-' + i)
										.css("background-image", "url(" + swiper.slides[activeSlideIndex + i].getAttribute("data-preview-bg") + ")");
								}
							}
						}
					},
				});

			$(window)
				.on("resize", function () {
					var mh = getSwiperHeight(s, "min-height"),
						h = getSwiperHeight(s, "height");
					if (h) {
						s.css("height", mh ? mh > h ? mh : h : h);
					}
				})
				.load(function () {
					s.find("video").each(function () {
						if (!$(this).parents(".swiper-slide-active").length) {
							this.pause();
						}
					});
				})
				.trigger("resize");
		});
	}

	/**
	 * Copyright Year
	 * @description  Evaluates correct copyright year
	 */
	var o = $("#copyright-year");
	if (o.length) {
		o.text(initialDate.getFullYear());
	}

	// Circle Progress
	if (plugins.circleProgress.length) {
		for (var i = 0; i < plugins.circleProgress.length; i++) {
			var circleProgressItem = $(plugins.circleProgress[i]);
			$document.on("scroll", $.proxy(function () {
				var $this = $(this);

				if (!$this.hasClass('animated') && isScrolledIntoView($this)) {

					var arrayGradients = $this.attr('data-gradient').split(",");

					$this.circleProgress({
						value: $this.attr('data-value'),
						size: $this.attr('data-size') ? $this.attr('data-size') : 175,
						fill: {gradient: arrayGradients, gradientAngle: Math.PI / 4},
						startAngle: -Math.PI / 4 * 2,
						emptyFill: $this.attr('data-empty-fill') ? $this.attr('data-empty-fill') : "rgb(245,245,245)",
						thickness: $this.attr('data-thickness') ? parseInt($this.attr('data-thickness'), 10) : 10

					}).on('circle-animation-progress', function (event, progress, stepValue) {
						$(this).find('span').text(String(stepValue.toFixed(2)).replace('0.', '').replace('1.', '1'));
					});
					$this.addClass('animated');
				}
			}, circleProgressItem))
				.trigger("scroll");
		}
	}

	/**
	 * Progress bar
	 * @description  Enable progress bar
	 */
	if (plugins.progressBar.length) {
		for (i = 0; i < plugins.progressBar.length; i++) {
			var progressBar = $(plugins.progressBar[i]);
			$window
				.on("scroll load", $.proxy(function () {
					var bar = $(this);
					if (!bar.hasClass('animated-first') && isScrolledIntoView(bar)) {
						var end = bar.attr("data-to");
						bar.find('.progress-bar-linear').css({width: end + '%'});
						bar.find('.progress-value').countTo({
							refreshInterval: 40,
							from: 0,
							to: end,
							speed: 500
						});
						bar.addClass('animated-first');
					}
				}, progressBar));
		}
	}

	/**
	 * Bootstrap tabs
	 * @description Activate Bootstrap Tabs
	 */
	if (plugins.bootstrapTabs.length) {
		var i;
		for (i = 0; i < plugins.bootstrapTabs.length; i++) {
			var bootstrapTab = $(plugins.bootstrapTabs[i]);

			bootstrapTab.on("click", "a", function (event) {
				event.preventDefault();
				$(this).tab('show');
			});
		}
	}

	/**
	 * RD Video Player
	 * @description Enables RD Video player plugin
	 */
	function hidePlaylist() {
		$(".rd-video-player").removeClass("playlist-show");
	}

	function showPlaylist() {
		$(".rd-video-player").addClass("playlist-show");
	}

	if (plugins.rdVideoPlayer.length) {
		var i;
		for (i = 0; i < plugins.rdVideoPlayer.length; i++) {
			var videoItem = $(plugins.rdVideoPlayer[i]);

			$window.on("scroll", $.proxy(function () {
				var video = $(this);
				if (isDesktop && !video.hasClass("played") && video.hasClass('play-on-scroll') && isScrolledIntoView(video)) {
					video.find("video")[0].play();
					video.addClass("played");
				}
			}, videoItem));

			videoItem.RDVideoPlayer({
				callbacks: {
					onPlay: hidePlaylist,
					onPaused: showPlaylist,
					onEnded: showPlaylist
				}
			});
			$window.on('load', showPlaylist);

			var volumeWrap = $(".rd-video-volume-wrap");

			volumeWrap.on("mouseenter", function () {
				$(this).addClass("hover")
			});

			volumeWrap.on("mouseleave", function () {
				$(this).removeClass("hover")
			});

			if (isTouch) {
				volumeWrap.find(".rd-video-volume").on("click", function () {
					$(this).toggleClass("hover")
				});
				$document.on("click", function (e) {
					if (!$(e.target).is(volumeWrap) && $(e.target).parents(volumeWrap).length == 0) {
						volumeWrap.find(".rd-video-volume").removeClass("hover")
					}
				})
			}
		}
	}

	/**
	 * Responsive Tabs
	 * @description Enables Responsive Tabs plugin
	 */
	if (plugins.responsiveTabs.length) {
		var i = 0;
		for (i = 0; i < plugins.responsiveTabs.length; i++) {
			var $this = $(plugins.responsiveTabs[i]);
			$this.easyResponsiveTabs({
				type: $this.attr("data-type"),
				tabidentify: $this.find(".resp-tabs-list").attr("data-group") || "tab"
			});
		}
	}

	/**
	 * Google maps
	 * */
	if (plugins.maps.length) {
		$.getScript("//maps.google.com/maps/api/js?key=AIzaSyAwH60q5rWrS8bXwpkZwZwhw9Bw0pqKTZM&sensor=false&libraries=geometry,places&v=3.7", function () {
			var head = document.getElementsByTagName('head')[0],
				insertBefore = head.insertBefore;

			head.insertBefore = function (newElement, referenceElement) {
				if (newElement.href && newElement.href.indexOf('//fonts.googleapis.com/css?family=Roboto') !== -1 || newElement.innerHTML.indexOf('gm-style') !== -1) {
					return;
				}
				insertBefore.call(head, newElement, referenceElement);
			};
			var geocoder = new google.maps.Geocoder;
			for (var i = 0; i < plugins.maps.length; i++) {
				var zoom = parseInt(plugins.maps[i].getAttribute("data-zoom"), 10) || 11;
				var styles = plugins.maps[i].hasAttribute('data-styles') ? JSON.parse(plugins.maps[i].getAttribute("data-styles")) : [];
				var center = plugins.maps[i].getAttribute("data-center") || "New York";

				// Initialize map
				var map = new google.maps.Map(plugins.maps[i].querySelectorAll(".google-map")[0], {
					zoom: zoom,
					styles: styles,
					scrollwheel: false,
					center: {lat: 0, lng: 0}
				});
				// Add map object to map node
				plugins.maps[i].map = map;
				plugins.maps[i].geocoder = geocoder;
				plugins.maps[i].google = google;

				// Get Center coordinates from attribute
				getLatLngObject(center, null, plugins.maps[i], function (location, markerElement, mapElement) {
					mapElement.map.setCenter(location);
				})

				// Add markers from google-map-markers array
				var markerItems = plugins.maps[i].querySelectorAll(".google-map-markers li");

				if (markerItems.length) {
					var markers = [];
					for (var j = 0; j < markerItems.length; j++) {
						var markerElement = markerItems[j];
						getLatLngObject(markerElement.getAttribute("data-location"), markerElement, plugins.maps[i], function (location, markerElement, mapElement) {
							var icon = markerElement.getAttribute("data-icon") || mapElement.getAttribute("data-icon");
							var activeIcon = markerElement.getAttribute("data-icon-active") || mapElement.getAttribute("data-icon-active");
							var info = markerElement.getAttribute("data-description") || "";
							var infoWindow = new google.maps.InfoWindow({
								content: info
							});
							markerElement.infoWindow = infoWindow;
							var markerData = {
								position: location,
								map: mapElement.map
							}
							if (icon) {
								markerData.icon = icon;
							}
							var marker = new google.maps.Marker(markerData);
							markerElement.gmarker = marker;
							markers.push({markerElement: markerElement, infoWindow: infoWindow});
							marker.isActive = false;
							// Handle infoWindow close click
							google.maps.event.addListener(infoWindow, 'closeclick', (function (markerElement, mapElement) {
								var markerIcon = null;
								markerElement.gmarker.isActive = false;
								markerIcon = markerElement.getAttribute("data-icon") || mapElement.getAttribute("data-icon");
								markerElement.gmarker.setIcon(markerIcon);
							}).bind(this, markerElement, mapElement));


							// Set marker active on Click and open infoWindow
							google.maps.event.addListener(marker, 'click', (function (markerElement, mapElement) {
								if (markerElement.infoWindow.getContent().length === 0) return;
								var gMarker, currentMarker = markerElement.gmarker, currentInfoWindow;
								for (var k = 0; k < markers.length; k++) {
									var markerIcon;
									if (markers[k].markerElement === markerElement) {
										currentInfoWindow = markers[k].infoWindow;
									}
									gMarker = markers[k].markerElement.gmarker;
									if (gMarker.isActive && markers[k].markerElement !== markerElement) {
										gMarker.isActive = false;
										markerIcon = markers[k].markerElement.getAttribute("data-icon") || mapElement.getAttribute("data-icon")
										gMarker.setIcon(markerIcon);
										markers[k].infoWindow.close();
									}
								}

								currentMarker.isActive = !currentMarker.isActive;
								if (currentMarker.isActive) {
									if (markerIcon = markerElement.getAttribute("data-icon-active") || mapElement.getAttribute("data-icon-active")) {
										currentMarker.setIcon(markerIcon);
									}

									currentInfoWindow.open(map, marker);
								} else {
									if (markerIcon = markerElement.getAttribute("data-icon") || mapElement.getAttribute("data-icon")) {
										currentMarker.setIcon(markerIcon);
									}
									currentInfoWindow.close();
								}
							}).bind(this, markerElement, mapElement))
						})
					}
				}
			}
		});
	}

	/**
	 * RD Input Label
	 * @description Enables RD Input Label Plugin
	 */
	if (plugins.rdInputLabel.length) {
		plugins.rdInputLabel.RDInputLabel();
	}

	/**
	 * Stepper
	 * @description Enables Stepper Plugin
	 */
	if (plugins.stepper.length) {
		plugins.stepper.stepper({
			labels: {
				up: "",
				down: ""
			}
		});
	}

	/**
	 * Radio
	 * @description Add custom styling options for input[type="radio"]
	 */
	if (plugins.radio.length) {
		var i;
		for (i = 0; i < plugins.radio.length; i++) {
			var $this = $(plugins.radio[i]);
			$this.addClass("radio-custom").after("<span class='radio-custom-dummy'></span>")
		}
	}

	/**
	 * Checkbox
	 * @description Add custom styling options for input[type="checkbox"]
	 */
	if (plugins.checkbox.length) {
		var i;
		for (i = 0; i < plugins.checkbox.length; i++) {
			var $this = $(plugins.checkbox[i]);
			$this.after("<span class='checkbox-custom-dummy'></span>")
		}
	}

	/**
	 * Toggles
	 * @description Make toggles from input[type="checkbox"]
	 */
	if (plugins.toggles.length) {
		var i;
		for (i = 0; i < plugins.toggles.length; i++) {
			var $this = $(plugins.toggles[i]);
			$this.after("<span class='toggle-custom-dummy'></span>")
		}
	}

	/**
	 * Regula
	 * @description Enables Regula plugin
	 */
	if (plugins.regula.length) {
		attachFormValidator(plugins.regula);
	}

	/**
	 * WOW
	 * @description Enables Wow animation plugin
	 */
	if ($html.hasClass('desktop') && $html.hasClass("wow-animation") && $(".wow").length) {
		new WOW().init();
	}

	/**
	 * Owl carousel
	 * @description Enables Owl carousel plugin
	 */
	if (plugins.owl.length) {
		for (var i = 0; i < plugins.owl.length; i++) {
			var c = $(plugins.owl[i]);
			plugins.owl[i] = c;

			//skip owl in bootstrap tabs
			if (!c.parents('.tab-content').length) {
				initOwlCarousel(c);
			}
		}
	}

	/**
	 * Isotope
	 * @description Enables Isotope plugin
	 */
	if (plugins.isotope.length) {
		var i, j, isogroup = [];
		for (i = 0; i < plugins.isotope.length; i++) {
			var isotopeItem = plugins.isotope[i],
				filterItems = $(isotopeItem).closest('.isotope-wrap').find('[data-isotope-filter]'),
				iso = new Isotope(isotopeItem,
					{
						itemSelector: '.isotope-item',
						layoutMode: isotopeItem.getAttribute('data-isotope-layout') ? isotopeItem.getAttribute('data-isotope-layout') : 'masonry',
						filter: '*',
					}
				);

			isogroup.push(iso);

			filterItems.on("click", function (e) {
				e.preventDefault();
				var filter = $(this),
					iso = $('.isotope[data-isotope-group="' + this.getAttribute("data-isotope-group") + '"]'),
					filtersContainer = filter.closest(".isotope-filters");

				filtersContainer
					.find('.active')
					.removeClass("active");
				filter.addClass("active");

				iso.isotope({
					itemSelector: '.isotope-item',
					layoutMode: iso.attr('data-isotope-layout') ? iso.attr('data-isotope-layout') : 'masonry',
					filter: this.getAttribute("data-isotope-filter") == '*' ? '*' : '[data-filter*="' + this.getAttribute("data-isotope-filter") + '"]'
				});

				$window.trigger('resize');

				// If d3Charts contains in isotop, resize it on click.
				if (filtersContainer.hasClass('isotope-has-d3-graphs') && c3ChartsArray != undefined) {
					setTimeout(function () {
						for (var j = 0; j < c3ChartsArray.length; j++) {
							c3ChartsArray[j].resize();
						}
					}, 500);
				}

			}).eq(0).trigger("click");
		}

		$(window).on('load', function () {
			setTimeout(function () {
				var i;
				for (i = 0; i < isogroup.length; i++) {
					isogroup[i].element.className += " isotope--loaded";
					isogroup[i].layout();
				}
			}, 600);
		});
	}

	/**
	 * RD Video
	 * @description Enables RD Video plugin
	 */
	if (plugins.rdVideoBG.length) {
		for (i = 0; i < plugins.rdVideoBG.length; i++) {
			var videoItem = $(plugins.rdVideoBG[i]);
			videoItem.RDVideo({});
		}
	}

	/**
	 * RD Navbar
	 * @description Enables RD Navbar plugin
	 */
	if (plugins.rdNavbar.length) {
		plugins.rdNavbar.RDNavbar({
			stickUpClone: (plugins.rdNavbar.attr("data-stick-up-clone")) ? plugins.rdNavbar.attr("data-stick-up-clone") === 'true' : false,
			stickUpOffset: (plugins.rdNavbar.attr("data-stick-up-offset")) ? plugins.rdNavbar.attr("data-stick-up-offset") : 1,
			stickUp: (!isNoviBuilder) ? plugins.rdNavbar.attr("data-stick-up") === 'true' : false,
			focusOnHover: !isNoviBuilder ? true : false,
			anchorNavOffset: -78
		});
		if (plugins.rdNavbar.attr("data-body-class")) {
			document.body.className += ' ' + plugins.rdNavbar.attr("data-body-class");
		}
	}

	/**
	 * lightGallery
	 * @description Enables lightGallery plugin
	 */
	if (plugins.lightGallery.length) {
		for (var i = 0; i < plugins.lightGallery.length; i++) {
			initLightGallery(plugins.lightGallery[i]);
		}
	}

	if (plugins.lightGalleryItem.length) {
		for (var i = 0; i < plugins.lightGalleryItem.length; i++) {
			initLightGalleryItem(plugins.lightGalleryItem[i]);
		}
	}

	if (plugins.lightDynamicGalleryItem.length) {
		for (var i = 0; i < plugins.lightDynamicGalleryItem.length; i++) {
			initDynamicLightGallery(plugins.lightDynamicGalleryItem[i]);
		}
	}

	/**
	 * Stacktable
	 * @description Enables Stacktable plugin
	 */
	if (plugins.stacktable.length) {
		var i;
		for (i = 0; i < plugins.stacktable.length; i++) {
			var stacktableItem = $(plugins.stacktable[i]);
			stacktableItem.stacktable();
		}
	}

	/**
	 * Select2
	 * @description Enables select2 plugin
	 */
	if (plugins.selectFilter.length) {
		var i;
		for (i = 0; i < plugins.selectFilter.length; i++) {
			var select = $(plugins.selectFilter[i]);

			select.select2({
				theme: "bootstrap"
			}).next().addClass(select.attr("class").match(/(input-sm)|(input-lg)|($)/i).toString().replace(new RegExp(",", 'g'), " "));
		}
	}

	/**
	 * RD Calendar
	 * @description Enables RD Calendar plugin
	 */
	if (plugins.calendar.length) {
		for (i = 0; i < plugins.calendar.length; i++) {
			var calendarItem = $(plugins.calendar[i]);

			calendarItem.rdCalendar({
				days: calendarItem.attr("data-days") ? c.attr("data-days").split(/\s?,\s?/i) : ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
				month: calendarItem.attr("data-months") ? c.attr("data-months").split(/\s?,\s?/i) : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
			});
		}
	}

	/**
	 * Page loader
	 * @description Enables Page loader
	 */
	if (plugins.pageLoader.length > 0) {

		$window.on("load", function () {
			var loader = setTimeout(function () {
				plugins.pageLoader.addClass("loaded");
				$window.trigger("resize");
			}, 200);
		});

	}

	/**
	 * RD Search
	 * @description Enables search
	 */
	if (plugins.search.length || plugins.searchResults) {
		var handler = "bat/rd-search.php";
		var defaultTemplate = '<h5 class="search_title"><a target="_top" href="#{href}" class="search_link">#{title}</a></h5>' +
			'<p>...#{token}...</p>' +
			'<p class="match"><em>Terms matched: #{count} - URL: #{href}</em></p>';
		var defaultFilter = '*.html';

		if (plugins.search.length) {

			for (i = 0; i < plugins.search.length; i++) {
				var searchItem = $(plugins.search[i]),
					options = {
						element: searchItem,
						filter: (searchItem.attr('data-search-filter')) ? searchItem.attr('data-search-filter') : defaultFilter,
						template: (searchItem.attr('data-search-template')) ? searchItem.attr('data-search-template') : defaultTemplate,
						live: (searchItem.attr('data-search-live')) ? searchItem.attr('data-search-live') : false,
						liveCount: (searchItem.attr('data-search-live-count')) ? parseInt(searchItem.attr('data-search-live')) : 4,
						current: 0, processed: 0, timer: {}
					};

				if ($('.rd-navbar-search-toggle').length) {
					var toggle = $('.rd-navbar-search-toggle');
					toggle.on('click', function () {
						if (!($(this).hasClass('active'))) {
							searchItem.find('input').val('').trigger('propertychange');
						}
					});
				}

				if (options.live) {
					searchItem.find('input').on("keyup input propertychange", $.proxy(function () {
						this.term = this.element.find('input').val().trim();
						this.spin = this.element.find('.input-group-addon');
						clearTimeout(this.timer);

						if (this.term.length > 2) {
							this.timer = setTimeout(liveSearch(this), 200);
						} else if (this.term.length == 0) {
							$('#' + this.live).addClass('cleared').html('');
						}
					}, options, this));
				}

				searchItem.submit($.proxy(function () {
					$('<input />').attr('type', 'hidden')
						.attr('name', "filter")
						.attr('value', this.filter)
						.appendTo(this.element);
					return true;
				}, options, this))
			}
		}

		if (plugins.searchResults.length) {
			var regExp = /\?.*s=([^&]+)\&filter=([^&]+)/g;
			var match = regExp.exec(location.search);

			if (match != null) {
				$.get(handler, {
					s: decodeURI(match[1]),
					dataType: "html",
					filter: match[2],
					template: defaultTemplate,
					live: ''
				}, function (data) {
					plugins.searchResults.html(data);
				})
			}
		}
	}

	/**
	 * UI To Top
	 * @description Enables ToTop Button
	 */
	if (isDesktop && !isNoviBuilder) {
		$().UItoTop({
			easingType: 'easeOutQuart',
			containerClass: 'ui-to-top icon icon-xs icon-circle icon-darker-filled mdi mdi-chevron-up'
		});
	}

	/**
	 * Google ReCaptcha
	 * @description Enables Google ReCaptcha
	 */
	if (plugins.captcha.length) {
		var i;
		$.getScript("//www.google.com/recaptcha/api.js?onload=onloadCaptchaCallback&render=explicit&hl=en");
	}

	/**
	 * RD Mailform
	 * @version      3.2.0
	 */
	if (plugins.rdMailForm.length) {
		var i, j, k,
			msg = {
				'MF000': 'Successfully sent!',
				'MF001': 'Recipients are not set!',
				'MF002': 'Form will not work locally!',
				'MF003': 'Please, define email field in your form!',
				'MF004': 'Please, define type of your form!',
				'MF254': 'Something went wrong with PHPMailer!',
				'MF255': 'Aw, snap! Something went wrong.'
			};

		for (i = 0; i < plugins.rdMailForm.length; i++) {
			var $form = $(plugins.rdMailForm[i]),
				formHasCaptcha = false;

			$form.attr('novalidate', 'novalidate').ajaxForm({
				data: {
					"form-type": $form.attr("data-form-type") || "contact",
					"counter": i
				},
				beforeSubmit: function (arr, $form, options) {
					if (isNoviBuilder)
						return;

					var form = $(plugins.rdMailForm[this.extraData.counter]),
						inputs = form.find("[data-constraints]"),
						output = $("#" + form.attr("data-form-output")),
						captcha = form.find('.recaptcha'),
						captchaFlag = true;

					output.removeClass("active error success");

					if (isValidated(inputs, captcha)) {

						// veify reCaptcha
						if (captcha.length) {
							var captchaToken = captcha.find('.g-recaptcha-response').val(),
								captchaMsg = {
									'CPT001': 'Please, setup you "site key" and "secret key" of reCaptcha',
									'CPT002': 'Something wrong with google reCaptcha'
								};

							formHasCaptcha = true;

							$.ajax({
								method: "POST",
								url: "bat/reCaptcha.php",
								data: {'g-recaptcha-response': captchaToken},
								async: false
							})
								.done(function (responceCode) {
									if (responceCode !== 'CPT000') {
										if (output.hasClass("snackbars")) {
											output.html('<p><span class="icon text-middle fa fa-check icon-xxs"></span><span>' + captchaMsg[responceCode] + '</span></p>')

											setTimeout(function () {
												output.removeClass("active");
											}, 3500);

											captchaFlag = false;
										} else {
											output.html(captchaMsg[responceCode]);
										}

										output.addClass("active");
									}
								});
						}

						if (!captchaFlag) {
							return false;
						}

						form.addClass('form-in-process');

						if (output.hasClass("snackbars")) {
							output.html('<p><span class="icon text-middle fa fa-circle-o-notch fa-spin icon-xxs"></span><span>Sending</span></p>');
							output.addClass("active");
						}
					} else {
						return false;
					}
				},
				error: function (result) {
					if (isNoviBuilder)
						return;

					var output = $("#" + $(plugins.rdMailForm[this.extraData.counter]).attr("data-form-output")),
						form = $(plugins.rdMailForm[this.extraData.counter]);

					output.text(msg[result]);
					form.removeClass('form-in-process');

					if (formHasCaptcha) {
						grecaptcha.reset();
					}
				},
				success: function (result) {
					if (isNoviBuilder)
						return;

					var form = $(plugins.rdMailForm[this.extraData.counter]),
						output = $("#" + form.attr("data-form-output")),
						select = form.find('select');

					form
						.addClass('success')
						.removeClass('form-in-process');

					if (formHasCaptcha) {
						grecaptcha.reset();
					}

					result = result.length === 5 ? result : 'MF255';
					output.text(msg[result]);

					if (result === "MF000") {
						if (output.hasClass("snackbars")) {
							output.html('<p><span class="icon text-middle fa fa-check icon-xxs"></span><span>' + msg[result] + '</span></p>');
						} else {
							output.addClass("active success");
						}
					} else {
						if (output.hasClass("snackbars")) {
							output.html(' <p class="snackbars-left"><span class="icon icon-xxs fa fa-exclamation-triangle text-middle"></span><span>' + msg[result] + '</span></p>');
						} else {
							output.addClass("active error");
						}
					}

					form.clearForm();

					if (select.length) {
						select.select2("val", "");
					}

					form.find('input, textarea').trigger('blur');

					setTimeout(function () {
						output.removeClass("active error success");
						form.removeClass('success');
					}, 3500);
				}
			});
		}
	}

	/**
	 * Custom Toggles
	 */
	if (plugins.customToggle.length) {
		var i;
		for (i = 0; i < plugins.customToggle.length; i++) {
			var $this = $(plugins.customToggle[i]);
			$this.on('click', function (e) {
				e.preventDefault();
				$("#" + $(this).attr('data-custom-toggle')).add(this).toggleClass('active');
			});

			if ($this.attr("data-custom-toggle-disable-on-blur") === "true") {
				$("body").on("click", $this, function (e) {
					if (e.target !== e.data[0] && $("#" + e.data.attr('data-custom-toggle')).find($(e.target)).length == 0 && e.data.find($(e.target)).length == 0) {
						$("#" + e.data.attr('data-custom-toggle')).add(e.data[0]).removeClass('active');
					}
				})
			}
		}
	}

	// jQuery Count To
	if (plugins.counter.length) {
		for (var i = 0; i < plugins.counter.length; i++) {
			var $counterNotAnimated = $(plugins.counter[i]).not('.animated');
			$document.on("scroll", $.proxy(function () {
				var $this = this;

				if ((!$this.hasClass("animated")) && (isScrolledIntoView($this))) {
					$this.countTo({
						refreshInterval: 40,
						from: 0,
						to: parseInt($this.text(), 10),
						speed: $this.attr("data-speed") || 1000
					});
					$this.addClass('animated');
				}
			}, $counterNotAnimated))
				.trigger("scroll");
		}
	}

	// TimeCircles
	if (plugins.dateCountdown.length) {
		for (var i = 0; i < plugins.dateCountdown.length; i++) {
			var dateCountdownItem = $(plugins.dateCountdown[i]),
				time = {
					"Days": {
						"text": "Days",
						"show": true,
						color: dateCountdownItem.attr("data-color") ? dateCountdownItem.attr("data-color") : "#f9f9f9"
					},
					"Hours": {
						"text": "Hours",
						"show": true,
						color: dateCountdownItem.attr("data-color") ? dateCountdownItem.attr("data-color") : "#f9f9f9"
					},
					"Minutes": {
						"text": "Minutes",
						"show": true,
						color: dateCountdownItem.attr("data-color") ? dateCountdownItem.attr("data-color") : "#f9f9f9"
					},
					"Seconds": {
						"text": "Seconds",
						"show": true,
						color: dateCountdownItem.attr("data-color") ? dateCountdownItem.attr("data-color") : "#f9f9f9"
					}
				};

			dateCountdownItem.TimeCircles({
				color: dateCountdownItem.attr("data-color") ? dateCountdownItem.attr("data-color") : "rgba(247, 247, 247, 1)",
				animation: "smooth",
				bg_width: dateCountdownItem.attr("data-bg-width") ? dateCountdownItem.attr("data-bg-width") : .9,
				circle_bg_color: dateCountdownItem.attr("data-bg") ? dateCountdownItem.attr("data-bg") : "rgba(0, 0, 0, 1)",
				fg_width: dateCountdownItem.attr("data-width") ? dateCountdownItem.attr("data-width") : 0.05
			});

			(function (dateCountdownItem, time) {
				$window.on('load resize orientationchange', function () {
					if (window.innerWidth < 479) {
						dateCountdownItem.TimeCircles({
							time: {
								"Days": {
									"text": "Days",
									"show": true,
									color: dateCountdownItem.attr("data-color") ? dateCountdownItem.attr("data-color") : "#f9f9f9"
								},
								"Hours": {
									"text": "Hours",
									"show": true,
									color: dateCountdownItem.attr("data-color") ? dateCountdownItem.attr("data-color") : "#f9f9f9"
								},
								"Minutes": {
									"text": "Minutes",
									"show": true,
									color: dateCountdownItem.attr("data-color") ? dateCountdownItem.attr("data-color") : "#f9f9f9"
								},
								Seconds: {
									"text": "Seconds",
									show: false,
									color: dateCountdownItem.attr("data-color") ? dateCountdownItem.attr("data-color") : "#f9f9f9"
								}
							}
						}).rebuild();
					} else if (window.innerWidth < 767) {
						dateCountdownItem.TimeCircles({
							time: {
								"Days": {
									"text": "Days",
									"show": true,
									color: dateCountdownItem.attr("data-color") ? dateCountdownItem.attr("data-color") : "#f9f9f9"
								},
								"Hours": {
									"text": "Hours",
									"show": true,
									color: dateCountdownItem.attr("data-color") ? dateCountdownItem.attr("data-color") : "#f9f9f9"
								},
								"Minutes": {
									"text": "Minutes",
									"show": true,
									color: dateCountdownItem.attr("data-color") ? dateCountdownItem.attr("data-color") : "#f9f9f9"
								},
								Seconds: {
									text: '',
									show: false,
									color: dateCountdownItem.attr("data-color") ? dateCountdownItem.attr("data-color") : "#f9f9f9"
								}
							}
						}).rebuild();
					} else {
						dateCountdownItem.TimeCircles({time: time}).rebuild();
					}
				});
			})(dateCountdownItem, time);
		}
	}

	/**
	 * Custom Waypoints
	 */
	if (plugins.customWaypoints.length) {
		var i;
		$document.delegate("[data-custom-scroll-to]", "click", function (e) {
			e.preventDefault();
			$("body, html").stop().animate({
				scrollTop: $("#" + $(this).attr('data-custom-scroll-to')).offset().top - 70
			}, 1000, function () {
				$(window).trigger("resize");
			});
		});
	}

	/**
	 * Bootstrap Date time picker
	 */
	if (plugins.bootstrapDateTimePicker.length) {
		var i;
		for (i = 0; i < plugins.bootstrapDateTimePicker.length; i++) {
			var $dateTimePicker = $(plugins.bootstrapDateTimePicker[i]);
			var options = {};

			options['format'] = 'dddd DD MMMM YYYY - HH:mm';
			if ($dateTimePicker.attr("data-time-picker") == "date") {
				options['format'] = 'dddd DD MMMM YYYY';
				options['minDate'] = new Date();
			} else if ($dateTimePicker.attr("data-time-picker") == "time") {
				options['format'] = 'HH:mm';
			}

			options["time"] = ($dateTimePicker.attr("data-time-picker") != "date");
			options["date"] = ($dateTimePicker.attr("data-time-picker") != "time");
			options["shortTime"] = true;

			$dateTimePicker.bootstrapMaterialDatePicker(options);
		}
	}

	/**
	 * Checkout RD Material Tabs
	 */
	if (plugins.checkoutRDTabs.length) {
		var i, step = 0;
		for (i = 0; i < plugins.checkoutRDTabs.length; i++) {
			var checkoutTab = $(plugins.checkoutRDTabs[i]);

			checkoutTab.RDMaterialTabs({
				dragList: true,
				dragContent: false,
				items: 1,
				marginContent: 10,
				margin: 0,
				responsive: {
					480: {
						items: 2
					},
					768: {
						dragList: false,
						items: 3
					}
				},
				callbacks: {
					onChangeStart: function (active, indexTo) {
						if (indexTo > step + 1) {
							return false;
						} else if (indexTo == step + 1) {
							for (var j = 0; j < this.$content.find(".rd-material-tab").length; j++) {
								if (j <= step) {
									var inputs = this.$content.find(".rd-material-tab").eq(j).find("[data-constraints]");

									if (!isValidated(inputs)) {
										this.setContentTransition(this, this.options.speed)
										this.moveTo(j);
										return false
									}
								}
							}
							if (indexTo > step) step = indexTo;
						}

					},
					onChangeEnd: function () {

					},
					onInit: function (tabs) {
						attachFormValidator(tabs.$element.find("[data-constraints]"));

						$('.checkout-step-btn').on("click", function (e) {
							e.preventDefault();
							var index = this.getAttribute("data-index-to"),
								inputs = tabs.$content.find(".rd-material-tab").eq(index - 1).find("[data-constraints]");

							if (isValidated(inputs)) {
								tabs.setContentTransition(tabs, tabs.options.speed);
								tabs.moveTo(parseInt(index));
								if (index > step) step = index;
							}
						});
					}
				}
			});
		}
	}

	/**
	 * Material Parallax
	 * @description Enables Material Parallax plugin
	 */
	if (plugins.materialParallax.length) {
		var i;

		if (!isNoviBuilder && !isIE && !isMobile) {
			plugins.materialParallax.parallax();
		} else {
			for (i = 0; i < plugins.materialParallax.length; i++) {
				var parallax = $(plugins.materialParallax[i]),
					imgPath = parallax.data("parallax-img");

				parallax.css({
					"background-image": 'url(' + imgPath + ')',
					"background-attachment": "fixed",
					"background-size": "cover"
				});
			}
		}
	}

	/**
	 *  Enable Faceboock iframe
	 */
	if (plugins.facebookplugin.length) {
		for (i = 0; i < plugins.facebookplugin.length; i++) {

			(function (d, s, id) {
				var js, fjs = d.getElementsByTagName(s)[0];
				if (d.getElementById(id)) return;
				js = d.createElement(s);
				js.id = id;
				js.src = "//connect.facebook.net/ru_RU/sdk.js#xfbml=1&version=v2.5";
				fjs.parentNode.insertBefore(js, fjs);
			}(document, 'script', 'facebook-jssdk'));
		}
	}

});

