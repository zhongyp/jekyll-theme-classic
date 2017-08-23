$(document).ready(function($) {
   
	$(window).scroll(
		function() {
			var previousTop = 0;
			var currentTop = $(window).scrollTop();
			if (currentTop < this.previousTop) {
				//scroll up
				if (currentTop > 0) {
					$('.docs-nav').addClass('is-fixed');
					$('.docs-nav').css('background','rgba(0, 0, 0, 0.7)');
					$('.docs-nav').css('position','fixed');
					$('.docs-nav').css('top','0px');
					$('.dropdown-menu').css('background','rgba(0, 0, 0, 0.7)');
				} else {
					$('.docs-nav').removeClass('is-fixed');
					$('.docs-nav').css('background','0 0');
					$('.docs-nav').css('position','absolute');
					$('.docs-nav').css('top','0px');
					$('.dropdown-menu').css('background','0 0');
				}
			} else {
				//scroll down
				$('.navbar-custom').removeClass('is-fixed');
				$('.docs-nav').css('background','0 0');
				$('.docs-nav').css('position','absolute');
				$('.docs-nav').css('top','0px');
				$('.dropdown-menu').css('background','0 0');
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