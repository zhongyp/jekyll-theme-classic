$(document).ready(function($) {
   
	$(window).scroll(
		function() {
			var previousTop = 0;
			var currentTop = $(window).scrollTop();
			if (currentTop < this.previousTop) {
				//scroll up
				if (currentTop > 0) {
					$('.docs-nav').addClass('is-fixed');
					$('.dropdown-menu').css('background','rgba(0, 0, 0, 0.4)');
					$('.docs-nav').addClass('is-visible');
					$('.docs-nav').removeClass('docs-nav-css');
				} else {
					$('.docs-nav').removeClass('is-fixed');
					$('.dropdown-menu').css('background','0 0');
					$('.docs-nav').removeClass('is-visible');
					$('.docs-nav').addClass('docs-nav-css');					

				}
			} else {
				//scroll down
				$('.dropdown-menu').css('background','0 0');
				$('.docs-nav').removeClass('is-visible');
				$('.docs-nav').addClass('docs-nav-css');
			}
			this.previousTop = currentTop;
		});
	$(".main .year .list").each(function (e, target) {
		var $target=  $(target),
			$ul = $target.find("ul");
		$target.height($ul.outerHeight()), $ul.css("position", "absolute");
	}); 
	$(".main .year>h2>a").click(function (e) {
		e.preventDefault();
		$(this).parents(".year").toggleClass("time-close");
	});
});