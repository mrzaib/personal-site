
{
	function debounce(func, wait, immediate) {
		var timeout;
		return function() {
			var context = this, args = arguments;
			var later = function() {
				timeout = null;
				if (!immediate) func.apply(context, args);
			};
			var callNow = immediate && !timeout;
			clearTimeout(timeout);
			timeout = setTimeout(later, wait);
			if (callNow) func.apply(context, args);
		};
    };
    
    class Slideshow {
        constructor(el) {
            this.DOM = {};
            this.DOM.el = el;
            this.settings = {
                animation: {
                    slides: {
                        duration: 600,
                        easing: 'easeOutQuint'
                    },
                    shape: {
                        duration: 300,
                        easing: {in: 'easeOutQuint', out: 'easeOutQuad'}
                    }
                },
                frameFill: '#f1f1f1'
            }
            this.init();
        }
        init() {
            this.DOM.slides = Array.from(this.DOM.el.querySelectorAll('.animated-frame-slideshow-1 .slides > .slide'));
            this.slidesTotal = this.DOM.slides.length;
            this.DOM.nav = this.DOM.el.querySelector('.animated-frame-slideshow-1 .slidenav');
            this.DOM.nextCtrl = this.DOM.nav.querySelector('.animated-frame-slideshow-1 .slidenav__item--next');
            this.DOM.prevCtrl = this.DOM.nav.querySelector('.animated-frame-slideshow-1 .slidenav__item--prev');
            this.current = 0;
            this.createFrame(); 
            this.initEvents();
        }
        createFrame() {
            this.rect = this.DOM.el.getBoundingClientRect();
            this.frameSize = this.rect.width/12;
            this.paths = {
                initial: this.calculatePath('initial'),
                final: this.calculatePath('final')
            };
            this.DOM.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            this.DOM.svg.setAttribute('class', 'shape');
            this.DOM.svg.setAttribute('width','100%');
            this.DOM.svg.setAttribute('height','100%');
            this.DOM.svg.setAttribute('viewbox',`0 0 ${this.rect.width} ${this.rect.height}`);
            this.DOM.svg.innerHTML = `<path fill="${this.settings.frameFill}" d="${this.paths.initial}"/>`;
            this.DOM.el.insertBefore(this.DOM.svg, this.DOM.nav);
            this.DOM.shape = this.DOM.svg.querySelector('path');
        }
        updateFrame() {
            this.paths.initial = this.calculatePath('initial');
            this.paths.final = this.calculatePath('final');
            this.DOM.svg.setAttribute('viewbox',`0 0 ${this.rect.width} ${this.rect.height}`);
            this.DOM.shape.setAttribute('d', this.isAnimating ? this.paths.final : this.paths.initial);
        }
        calculatePath(path = 'initial') {
            return path === 'initial' ?
                    `M 0,0 0,${this.rect.height} ${this.rect.width},${this.rect.height} ${this.rect.width},0 0,0 Z M 0,0 ${this.rect.width},0 ${this.rect.width},${this.rect.height} 0,${this.rect.height} Z` :
                    `M 0,0 0,${this.rect.height} ${this.rect.width},${this.rect.height} ${this.rect.width},0 0,0 Z M ${this.frameSize},${this.frameSize} ${this.rect.width-this.frameSize},${this.frameSize} ${this.rect.width-this.frameSize},${this.rect.height-this.frameSize} ${this.frameSize},${this.rect.height-this.frameSize} Z`;
        }
        initEvents() {
            this.DOM.nextCtrl.addEventListener('click', () => this.navigate('next'));
            this.DOM.prevCtrl.addEventListener('click', () => this.navigate('prev'));
            
            window.addEventListener('resize', debounce(() => {
                this.rect = this.DOM.el.getBoundingClientRect();
                this.updateFrame();
            }, 20));
            
            document.addEventListener('keydown', (ev) => {
                const keyCode = ev.keyCode || ev.which;
                if ( keyCode === 37 ) {
                    this.navigate('prev');
                }
                else if ( keyCode === 39 ) {
                    this.navigate('next');
                }
            });
        }
        navigate(dir = 'next') {
            if ( this.isAnimating ) return false;
            this.isAnimating = true;

            const animateShapeIn = anime({
                targets: this.DOM.shape,
                duration: this.settings.animation.shape.duration,
                easing: this.settings.animation.shape.easing.in,
                d: this.paths.final
            });

            const animateSlides = () => {
                return new Promise((resolve, reject) => {
                    const currentSlide = this.DOM.slides[this.current];
                    anime({
                        targets: currentSlide,
                        duration: this.settings.animation.slides.duration,
                        easing: this.settings.animation.slides.easing,
                        translateX: dir === 'next' ? -1*this.rect.width : this.rect.width,
                        complete: () => {
                            currentSlide.classList.remove('slide--current');
                            resolve();
                        }
                    });
        
                    this.current = dir === 'next' ? 
                        this.current < this.slidesTotal-1 ? this.current + 1 : 0 :
                        this.current > 0 ? this.current - 1 : this.slidesTotal-1; 
                    
                    const newSlide = this.DOM.slides[this.current];
                    newSlide.classList.add('slide--current');
                    anime({
                        targets: newSlide,
                        duration: this.settings.animation.slides.duration,
                        easing: this.settings.animation.slides.easing,
                        translateX: [dir === 'next' ? this.rect.width : -1*this.rect.width,0]
                    });
        
                    const newSlideImg = newSlide.querySelector('.animated-frame-slideshow-1 .slide__img');
                    anime.remove(newSlideImg);
                    anime({
                        targets: newSlideImg,
                        duration: this.settings.animation.slides.duration*4,
                        easing: this.settings.animation.slides.easing,
                        translateX: [dir === 'next' ? 200 : -200, 0]
                    });
        
                    anime({
                        targets: [newSlide.querySelector('.animated-frame-slideshow-1 .slide__title'), newSlide.querySelector('.animated-frame-slideshow-1 .slide__desc'), newSlide.querySelector('.animated-frame-slideshow-1 .slide__link')],
                        duration: this.settings.animation.slides.duration*2,
                        easing: this.settings.animation.slides.easing,
                        delay: (t,i) => i*100+100,
                        translateX: [dir === 'next' ? 300 : -300,0],
                        opacity: [0,1]
                    });
                });
            };

            const animateShapeOut = () => {
                anime({
                    targets: this.DOM.shape,
                    duration: this.settings.animation.shape.duration,
                    delay: 150,
                    easing: this.settings.animation.shape.easing.out,
                    d: this.paths.initial,
                    complete: () => this.isAnimating = false
                });
            }

            animateShapeIn.finished.then(animateSlides).then(animateShapeOut);
        }
    };

    new Slideshow(document.querySelector('.animated-frame-slideshow-1 .slideshow'));
    imagesLoaded('.animated-frame-slideshow-1 .slide__img', { background: true }, () => document.body.classList.remove('loading'));
	var my_slide1 = new Slideshow(document.querySelector('.animated-frame-slideshow-1 .slideshow'));
	imagesLoaded('.animated-frame-slideshow-1 .slide__img', { background: true }, () => document.body.classList.remove('loading'));

	setInterval(function(){
	my_slide1.navigate('next');
	},5000);

};



{

	function debounce(func, wait, immediate) {
		var timeout;
		return function() {
			var context = this, args = arguments;
			var later = function() {
				timeout = null;
				if (!immediate) func.apply(context, args);
			};
			var callNow = immediate && !timeout;
			clearTimeout(timeout);
			timeout = setTimeout(later, wait);
			if (callNow) func.apply(context, args);
		};
    };
    
    class Slideshow {
        constructor(el) {
            this.DOM = {};
            this.DOM.el = el;
            this.settings = {
                animation: {
                    slides: {
                        duration: 600,
                        easing: 'easeOutQuint'
                    },
                    shape: {
                        duration: 300,
                        easing: {in: 'easeOutQuad', out: 'easeOutQuad'}
                    }
                },
                frameFill: '#111'
            }
            this.init();
        }
        init() {
            this.DOM.slides = Array.from(this.DOM.el.querySelectorAll('.animated-frame-slideshow-2 .slides > .slide'));
            this.slidesTotal = this.DOM.slides.length;
            this.DOM.nav = this.DOM.el.querySelector('.animated-frame-slideshow-2 .slidenav');
            this.DOM.nextCtrl = this.DOM.nav.querySelector('.animated-frame-slideshow-2 .slidenav__item--next');
            this.DOM.prevCtrl = this.DOM.nav.querySelector('.animated-frame-slideshow-2 .slidenav__item--prev');
            this.current = 0;
            this.createFrame(); 
            this.initEvents();
        }
        createFrame() {
            this.rect = this.DOM.el.getBoundingClientRect();
            this.frameSize = this.rect.width/12;
            this.paths = {
                initial: this.calculatePath('initial'),
                final: this.calculatePath('final')
            };
            this.DOM.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            this.DOM.svg.setAttribute('class', 'shape');
            this.DOM.svg.setAttribute('width','100%');
            this.DOM.svg.setAttribute('height','100%');
            this.DOM.svg.setAttribute('viewbox',`0 0 ${this.rect.width} ${this.rect.height}`);
            this.DOM.svg.innerHTML = `<path fill="${this.settings.frameFill}" d="${this.paths.initial}"/>`;
            this.DOM.el.insertBefore(this.DOM.svg, this.DOM.nav);
            this.DOM.shape = this.DOM.svg.lastElementChild;
        }
        updateFrame() {
            this.paths.initial = this.calculatePath('initial');
            this.paths.final = this.calculatePath('final');
            this.DOM.svg.setAttribute('viewbox',`0 0 ${this.rect.width} ${this.rect.height}`);
            this.DOM.shape.setAttribute('d', this.isAnimating ? this.paths.final : this.paths.initial);
        }
        calculatePath(path = 'initial') {
            if ( path === 'initial' ) {
                return `M 0,0 0,${this.rect.height} ${this.rect.width},${this.rect.height} ${this.rect.width},0 0,0 Z M 0,0 ${this.rect.width},0 ${this.rect.width},${this.rect.height} 0,${this.rect.height} Z`;
            }
            else {
                return {
                    next: `M 0,0 0,${this.rect.height} ${this.rect.width},${this.rect.height} ${this.rect.width},0 0,0 Z M ${this.frameSize},${this.frameSize} ${this.rect.width-this.frameSize},${this.frameSize/2} ${this.rect.width-this.frameSize},${this.rect.height-this.frameSize/2} ${this.frameSize},${this.rect.height-this.frameSize} Z`,
                    prev: `M 0,0 0,${this.rect.height} ${this.rect.width},${this.rect.height} ${this.rect.width},0 0,0 Z M ${this.frameSize},${this.frameSize/2} ${this.rect.width-this.frameSize},${this.frameSize} ${this.rect.width-this.frameSize},${this.rect.height-this.frameSize} ${this.frameSize},${this.rect.height-this.frameSize/2} Z`
                }
            }
        }
        initEvents() {
            this.DOM.nextCtrl.addEventListener('click', () => this.navigate('next'));
            this.DOM.prevCtrl.addEventListener('click', () => this.navigate('prev'));
            
            window.addEventListener('resize', debounce(() => {
                this.rect = this.DOM.el.getBoundingClientRect();
                this.updateFrame();
            }, 20));
            
            document.addEventListener('keydown', (ev) => {
                const keyCode = ev.keyCode || ev.which;
                if ( keyCode === 37 ) {
                    this.navigate('prev');
                }
                else if ( keyCode === 39 ) {
                    this.navigate('next');
                }
            });
        }
        navigate(dir = 'next') {
            if ( this.isAnimating ) return false;
            this.isAnimating = true;

            const animateShapeIn = anime({
                targets: this.DOM.shape,
                duration: this.settings.animation.shape.duration,
                easing: this.settings.animation.shape.easing.in,
                d: dir === 'next' ? this.paths.final.next : this.paths.final.prev
            });

            const animateSlides = () => {
                return new Promise((resolve, reject) => {
                    const currentSlide = this.DOM.slides[this.current];
                    anime({
                        targets: currentSlide,
                        duration: this.settings.animation.slides.duration,
                        easing: this.settings.animation.slides.easing,
                        translateX: dir === 'next' ? -1*this.rect.width : this.rect.width,
                        complete: () => {
                            currentSlide.classList.remove('slide--current');
                            resolve();
                        }
                    });
        
                    this.current = dir === 'next' ? 
                        this.current < this.slidesTotal-1 ? this.current + 1 : 0 :
                        this.current > 0 ? this.current - 1 : this.slidesTotal-1; 
                    
                    const newSlide = this.DOM.slides[this.current];
                    newSlide.classList.add('slide--current');
                    anime({
                        targets: newSlide,
                        duration: this.settings.animation.slides.duration,
                        easing: this.settings.animation.slides.easing,
                        translateX: [dir === 'next' ? this.rect.width : -1*this.rect.width,0]
                    });
        
                    const newSlideImg = newSlide.querySelector('.animated-frame-slideshow-2 .slide__img');
                    newSlideImg.style.transformOrigin = dir === 'next' ? '-10% 50%' : '110% 50%';
                    anime.remove(newSlideImg);
                    anime({
                        targets: newSlideImg,
                        duration: this.settings.animation.slides.duration*4,
                        easing: 'easeOutElastic',
                        elasticity: 350,
                        scale: [1.2,1],
                        rotate: [dir === 'next' ? 4 : -4,0]
                    });
        
                    anime({
                        targets: [newSlide.querySelector('.animated-frame-slideshow-2 .slide__title'), newSlide.querySelector('.animated-frame-slideshow-2 .slide__desc'), newSlide.querySelector('.animated-frame-slideshow-2 .slide__link')],
                        duration: this.settings.animation.slides.duration,
                        easing: this.settings.animation.slides.easing,
                        delay: (t,i,total) => dir === 'next' ? i*100+750 : (total-i-1)*100+750,
                        translateY: [dir === 'next' ? 300 : -300,0],
                        rotate: [15,0],
                        opacity: [0,1]
                    });
                });
            };

            const animateShapeOut = () => {
                anime({
                    targets: this.DOM.shape,
                    duration: this.settings.animation.shape.duration,
                    delay: 150,
                    easing: this.settings.animation.shape.easing.out,
                    d: this.paths.initial,
                    complete: () => this.isAnimating = false
                });
            }

            animateShapeIn.finished.then(animateSlides).then(animateShapeOut);
        }
    };

    new Slideshow(document.querySelector('.animated-frame-slideshow-2 .slideshow'));
    imagesLoaded('.animated-frame-slideshow-2 .slide__img', { background: true }, () => document.body.classList.remove('loading'));
	
	var my_slide2 = new Slideshow(document.querySelector('.animated-frame-slideshow-2 .slideshow'));
	imagesLoaded('.animated-frame-slideshow-2 .slide__img', { background: true }, () => document.body.classList.remove('loading'));

	setInterval(function(){
	my_slide2.navigate('next');
	},5000);
};



{
	function debounce(func, wait, immediate) {
		var timeout;
		return function() {
			var context = this, args = arguments;
			var later = function() {
				timeout = null;
				if (!immediate) func.apply(context, args);
			};
			var callNow = immediate && !timeout;
			clearTimeout(timeout);
			timeout = setTimeout(later, wait);
			if (callNow) func.apply(context, args);
		};
    };
    
    class Slideshow {
        constructor(el) {
            this.DOM = {};
            this.DOM.el = el;
            this.settings = {
                animation: {
                    slides: {
                        duration: 600,
                        easing: 'easeOutQuint'
                    },
                    shape: {
                        duration: 300,
                        easing: {in: 'easeOutQuad', out: 'easeOutQuad'}
                    }
                },
                frameFill: 'url(#gradient1)'
            }
            this.init();
        }
        init() {
            this.DOM.slides = Array.from(this.DOM.el.querySelectorAll('.animated-frame-slideshow-3 .slides > .slide'));
            this.slidesTotal = this.DOM.slides.length;
            this.DOM.nav = this.DOM.el.querySelector('.animated-frame-slideshow-3 .slidenav');
            this.DOM.nextCtrl = this.DOM.nav.querySelector('.animated-frame-slideshow-3 .slidenav__item--next');
            this.DOM.prevCtrl = this.DOM.nav.querySelector('.animated-frame-slideshow-3 .slidenav__item--prev');
            this.current = 0;
            this.createFrame(); 
            this.initEvents();
        }
        createFrame() {
            this.rect = this.DOM.el.getBoundingClientRect();
            this.frameSize = this.rect.width/12;
            this.paths = {
                initial: this.calculatePath('initial'),
                final: this.calculatePath('final')
            };
            this.DOM.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            this.DOM.svg.setAttribute('class', 'shape');
            this.DOM.svg.setAttribute('width','100%');
            this.DOM.svg.setAttribute('height','100%');
            this.DOM.svg.setAttribute('viewbox',`0 0 ${this.rect.width} ${this.rect.height}`);
            this.DOM.svg.innerHTML = `
                <defs>
                <linearGradient id="gradient1" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stop-color="#ED4264">
                        <!--animate attributeName="stop-color" values="#ED4264; #FFEDBC; #ED4264" dur="3s" repeatCount="indefinite"></animate-->
                    </stop>
                    <stop offset="100%" stop-color="#FFEDBC">
                        <!--animate attributeName="stop-color" values="#FFEDBC; #ED4264; #FFEDBC" dur="3s" repeatCount="indefinite"></animate-->
                    </stop>
                </linearGradient>
                </defs>
                <path fill="${this.settings.frameFill}" d="${this.paths.initial}"/>
            `;
            this.DOM.el.insertBefore(this.DOM.svg, this.DOM.nav);
            this.DOM.shape = this.DOM.svg.querySelector('path');
        }
        updateFrame() {
            this.paths.initial = this.calculatePath('initial');
            this.paths.final = this.calculatePath('final');
            this.DOM.svg.setAttribute('viewbox',`0 0 ${this.rect.width} ${this.rect.height}`);
            this.DOM.shape.setAttribute('d', this.paths.initial);
        }
        calculatePath(path = 'initial') {
            if ( path === 'initial' ) {
                return `M 0,0 0,${this.rect.height} ${this.rect.width},${this.rect.height} ${this.rect.width},0 0,0 Z M 0,0 ${this.rect.width},0 ${this.rect.width},${this.rect.height} 0,${this.rect.height} Z`;
            }
            else {
                return {
                    step1: `M 0,0 0,${this.rect.height} ${this.rect.width},${this.rect.height} ${this.rect.width},0 0,0 Z M ${this.frameSize},${this.frameSize} ${this.rect.width},0 ${this.rect.width},${this.rect.height} 0,${this.rect.height} Z`,
                    step2: `M 0,0 0,${this.rect.height} ${this.rect.width},${this.rect.height} ${this.rect.width},0 0,0 Z M ${this.frameSize},${this.frameSize} ${this.rect.width-this.frameSize},${this.frameSize} ${this.rect.width},${this.rect.height} 0,${this.rect.height} Z`,
                    step3: `M 0,0 0,${this.rect.height} ${this.rect.width},${this.rect.height} ${this.rect.width},0 0,0 Z M ${this.frameSize},${this.frameSize} ${this.rect.width-this.frameSize},${this.frameSize} ${this.rect.width-this.frameSize},${this.rect.height-this.frameSize} 0,${this.rect.height} Z`,
                    step4: `M 0,0 0,${this.rect.height} ${this.rect.width},${this.rect.height} ${this.rect.width},0 0,0 Z M ${this.frameSize},${this.frameSize} ${this.rect.width-this.frameSize},${this.frameSize} ${this.rect.width-this.frameSize},${this.rect.height-this.frameSize} ${this.frameSize},${this.rect.height-this.frameSize} Z`
                }
            }
        }
        initEvents() {
            this.DOM.nextCtrl.addEventListener('click', () => this.navigate('next'));
            this.DOM.prevCtrl.addEventListener('click', () => this.navigate('prev'));
            
            window.addEventListener('resize', debounce(() => {
                this.rect = this.DOM.el.getBoundingClientRect();
                this.updateFrame();
            }, 20));
            
            document.addEventListener('keydown', (ev) => {
                const keyCode = ev.keyCode || ev.which;
                if ( keyCode === 37 ) {
                    this.navigate('prev');
                }
                else if ( keyCode === 39 ) {
                    this.navigate('next');
                }
            });
        }
        navigate(dir = 'next') {
            if ( this.isAnimating ) return false;
            this.isAnimating = true;

            const animateShapeInTimeline = anime.timeline({
                duration: this.settings.animation.shape.duration,
                easing: this.settings.animation.shape.easing.in
            });  
            animateShapeInTimeline
                .add({
                    targets: this.DOM.shape,
                    d: this.paths.final.step1
                })
                .add({
                    targets: this.DOM.shape,
                    d: this.paths.final.step2,
                    offset: `-=${this.settings.animation.shape.duration*.5}`
                })
                .add({
                    targets: this.DOM.shape,
                    d: this.paths.final.step3,
                    offset: `-=${this.settings.animation.shape.duration*.5}`
                })
                .add({
                    targets: this.DOM.shape,
                    d: this.paths.final.step4,
                    offset: `-=${this.settings.animation.shape.duration*.5}`
                });

            const animateSlides = () => {
                return new Promise((resolve, reject) => {
                    const currentSlide = this.DOM.slides[this.current];
                    anime({
                        targets: currentSlide,
                        duration: this.settings.animation.slides.duration,
                        easing: this.settings.animation.slides.easing,
                        translateX: dir === 'next' ? -1*this.rect.width : this.rect.width,
                        complete: () => {
                            currentSlide.classList.remove('slide--current');
                            resolve();
                        }
                    });
        
                    this.current = dir === 'next' ? 
                        this.current < this.slidesTotal-1 ? this.current + 1 : 0 :
                        this.current > 0 ? this.current - 1 : this.slidesTotal-1; 
                    
                    const newSlide = this.DOM.slides[this.current];
                    newSlide.classList.add('slide--current');
                    anime({
                        targets: newSlide,
                        duration: this.settings.animation.slides.duration,
                        easing: this.settings.animation.slides.easing,
                        translateX: [dir === 'next' ? this.rect.width : -1*this.rect.width,0]
                    });
        
                    const newSlideImg = newSlide.querySelector('.animated-frame-slideshow-3 .slide__img');
                    anime.remove(newSlideImg);
                    anime({
                        targets: newSlideImg,
                        duration: this.settings.animation.slides.duration*4,
                        easing: this.settings.animation.slides.easing,
                        translateX: [dir === 'next' ? 200 : -200, 0]
                    });
        
                    anime({
                        targets: [newSlide.querySelector('.animated-frame-slideshow-3 .slide__title'), newSlide.querySelector('.animated-frame-slideshow-3 .slide__desc'), newSlide.querySelector('.animated-frame-slideshow-3 .slide__link')],
                        duration: this.settings.animation.slides.duration*2,
                        easing: this.settings.animation.slides.easing,
                        delay: (t,i) => i*100+100,
                        translateX: [dir === 'next' ? 300 : -300,0],
                        opacity: [0,1]
                    });
                });
            };

            const animateShapeOut = () => {  
                const animateShapeOutTimeline = anime.timeline({
                    duration: this.settings.animation.shape.duration,
                    easing: this.settings.animation.shape.easing.out
                });  
                animateShapeOutTimeline
                    .add({
                        targets: this.DOM.shape,
                        d: this.paths.final.step3
                    })
                    .add({
                        targets: this.DOM.shape,
                        d: this.paths.final.step2,
                        offset: `-=${this.settings.animation.shape.duration*.5}`
                    })
                    .add({
                        targets: this.DOM.shape,
                        d: this.paths.final.step1,
                        offset: `-=${this.settings.animation.shape.duration*.5}`
                    })
                    .add({
                        targets: this.DOM.shape,
                        d: this.paths.initial,
                        offset: `-=${this.settings.animation.shape.duration*.5}`,
                        complete: () => this.isAnimating = false
                    });
            }

            animateShapeInTimeline.finished.then(animateSlides).then(animateShapeOut);
        }
    };

    new Slideshow(document.querySelector('.animated-frame-slideshow-3 .slideshow'));
    imagesLoaded('.animated-frame-slideshow-3 .slide__img', { background: true }, () => document.body.classList.remove('loading'));
	var my_slide3 = new Slideshow(document.querySelector('.animated-frame-slideshow-3 .slideshow'));
	imagesLoaded('.animated-frame-slideshow-3 .slide__img', { background: true }, () => document.body.classList.remove('loading'));

	setInterval(function(){
	my_slide3.navigate('next');
	},5000);
};



{
    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function getRandomFloat(minValue,maxValue,precision) {
        if ( typeof(precision) == 'undefined' ) {
            precision = 2;
        }
        return parseFloat(Math.min(minValue + (Math.random() * (maxValue - minValue)),maxValue).toFixed(precision));
    }

    // 
	function debounce(func, wait, immediate) {
		var timeout;
		return function() {
			var context = this, args = arguments;
			var later = function() {
				timeout = null;
				if (!immediate) func.apply(context, args);
			};
			var callNow = immediate && !timeout;
			clearTimeout(timeout);
			timeout = setTimeout(later, wait);
			if (callNow) func.apply(context, args);
		};
    };
    
    class Slideshow {
        constructor(el) {
            this.DOM = {};
            this.DOM.el = el;
            this.settings = {
                animation: {
                    slides: {
                        duration: 400,
                        easing: 'easeOutQuint'
                    },
                    shape: {
                        duration: 400,
                        easing: {in: 'easeOutQuint', out: 'easeInQuad'}
                    }
                },
                frameFill: '#000'
            }
            this.init();
        }
        init() {
            this.DOM.slides = Array.from(this.DOM.el.querySelectorAll('.animated-frame-slideshow-4 .slides--images > .slide'));
            this.slidesTotal = this.DOM.slides.length;
            this.DOM.nav = this.DOM.el.querySelector('.animated-frame-slideshow-4 .slidenav');
            this.DOM.titles = this.DOM.el.querySelector('.animated-frame-slideshow-4 .slides--titles');
            this.DOM.titlesSlides = Array.from(this.DOM.titles.querySelectorAll('.animated-frame-slideshow-4 .slide'));
            this.DOM.nextCtrl = this.DOM.nav.querySelector('.animated-frame-slideshow-4 .slidenav__item--next');
            this.DOM.prevCtrl = this.DOM.nav.querySelector('.animated-frame-slideshow-4 .slidenav__item--prev');
            this.current = 0;
            this.createFrame(); 
            this.initEvents();
        }
        createFrame() {
            this.rect = this.DOM.el.getBoundingClientRect();
            this.frameSize = this.rect.width/12;
            this.paths = {
                initial: this.calculatePath('initial'),
                final: this.calculatePath('final')
            };
            this.DOM.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            this.DOM.svg.setAttribute('class', 'shape');
            this.DOM.svg.setAttribute('width','100%');
            this.DOM.svg.setAttribute('height','100%');
            this.DOM.svg.setAttribute('viewbox',`0 0 ${this.rect.width} ${this.rect.height}`);
            
            const imgFillSize = this.calculateImgFillSizes();
            this.DOM.svg.innerHTML = `
                <defs>
                    <clipPath id="shape__clip">
                        <path fill="${this.settings.frameFill}" d="${this.paths.initial}"/>
                    </clipPath>
                </defs>
                <image xlink:href="https://images.unsplash.com/photo-1456154875099-97a3a56074d3?ixlib=rb-0.3.5&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max&ixid=eyJhcHBfaWQiOjIwOTIyfQ&s=783c90aea40be92bd4b535838aab87f3" clip-path="url(#shape__clip)" x="0" y="0" width="${imgFillSize.width}px" height="${imgFillSize.height}px"/>
            `;
            this.DOM.el.insertBefore(this.DOM.svg, this.DOM.titles);
            this.DOM.shape = this.DOM.svg.querySelector('path');
            this.DOM.imgFill = this.DOM.svg.querySelector('image');
        }
        calculateImgFillSizes() {
            const ratio = Math.max(this.rect.width / 1920, this.rect.height / 1140);
            return {width: 1920*ratio, height: 1140*ratio};
        }
        updateFrame() {
            this.paths.initial = this.calculatePath('initial');
            this.paths.final = this.calculatePath('final');
            this.DOM.svg.setAttribute('viewbox',`0 0 ${this.rect.width} ${this.rect.height}`);
            this.DOM.shape.setAttribute('d', this.isAnimating ? this.paths.final : this.paths.initial);
            const imgFillSize = this.calculateImgFillSizes();
            this.DOM.imgFill.setAttribute('width',`${imgFillSize.width}px`);
            this.DOM.imgFill.setAttribute('height',`${imgFillSize.height}px`);
        }
        calculatePath(path = 'initial') {
            const r = Math.sqrt(Math.pow(this.rect.height,2) + Math.pow(this.rect.width,2));
            const rInitialOuter = r;
            const rInitialInner = r;
            const rFinalOuter = r;
            const rFinalInner = this.rect.width/3*getRandomFloat(0.2,0.4);
            const getCenter = () => `${getRandomInt(rFinalInner,this.rect.width-rFinalInner)}, ${getRandomInt(rFinalInner,this.rect.height-rFinalInner)}`;
            return path === 'initial' ? 
                `M ${this.rect.width/2}, ${this.rect.height/2} m 0 ${-rInitialOuter} a ${rInitialOuter} ${rInitialOuter} 0 1 0 1 0 z m -1 ${rInitialOuter-rInitialInner} a ${rInitialInner} ${rInitialInner} 0 1 1 -1 0 Z` :
                `M ${getCenter()} m 0 ${-rFinalOuter} a ${rFinalOuter} ${rFinalOuter} 0 1 0 1 0 z m -1 ${rFinalOuter-rFinalInner} a ${rFinalInner} ${rFinalInner} 0 1 1 -1 0 Z`;
        }
        initEvents() {
            this.DOM.nextCtrl.addEventListener('click', () => this.navigate('next'));
            this.DOM.prevCtrl.addEventListener('click', () => this.navigate('prev'));
            
            window.addEventListener('resize', debounce(() => {
                this.rect = this.DOM.el.getBoundingClientRect();
                this.updateFrame();
            }, 20));
            
            document.addEventListener('keydown', (ev) => {
                const keyCode = ev.keyCode || ev.which;
                if ( keyCode === 37 ) {
                    this.navigate('prev');
                }
                else if ( keyCode === 39 ) {
                    this.navigate('next');
                }
            });
        }
        navigate(dir = 'next') {
            if ( this.isAnimating ) return false;
            this.isAnimating = true;

            const animateShapeIn = anime({
                targets: this.DOM.shape,
                duration: this.settings.animation.shape.duration,
                easing: this.settings.animation.shape.easing.in,
                d: this.calculatePath('final')
            });

            const animateSlides = () => {
                return new Promise((resolve, reject) => {
                    const currentSlide = this.DOM.slides[this.current];
                    anime({
                        targets: currentSlide,
                        duration: this.settings.animation.slides.duration,
                        easing: this.settings.animation.slides.easing,
                        translateY: dir === 'next' ? -1*this.rect.height : this.rect.height,
                        complete: () => {
                            currentSlide.classList.remove('slide--current');
                            resolve();
                        }
                    });

                    const currentTitleSlide = this.DOM.titlesSlides[this.current];
                    anime({
                        targets: currentTitleSlide.children,
                        duration: this.settings.animation.slides.duration,
                        easing: this.settings.animation.slides.easing,
                        delay: (t,i,total) => dir === 'next' ? i*100 : (total-i-1)*100,
                        translateY: [0, dir === 'next' ? -100 : 100],
                        opacity: [1,0],
                        complete: () => {
                            currentTitleSlide.classList.remove('slide--current');
                            resolve();
                        }
                    });
        
                    this.current = dir === 'next' ? 
                        this.current < this.slidesTotal-1 ? this.current + 1 : 0 :
                        this.current > 0 ? this.current - 1 : this.slidesTotal-1; 
                    
                    const newSlide = this.DOM.slides[this.current];
                    newSlide.classList.add('slide--current');
                    anime({
                        targets: newSlide,
                        duration: this.settings.animation.slides.duration,
                        easing: this.settings.animation.slides.easing,
                        translateY: [dir === 'next' ? this.rect.height : -1*this.rect.height,0]
                    });
        
                    const newSlideImg = newSlide.querySelector('.animated-frame-slideshow-4 .slide__img');
                    anime.remove(newSlideImg);
                    anime({
                        targets: newSlideImg,
                        duration: this.settings.animation.slides.duration*4,
                        easing: this.settings.animation.slides.easing,
                        translateY: [dir === 'next' ? 100 : -100, 0]
                    });
        
                    const newTitleSlide = this.DOM.titlesSlides[this.current];
                    newTitleSlide.classList.add('slide--current');
                    anime({
                        targets: newTitleSlide.children,
                        duration: this.settings.animation.slides.duration*2,
                        easing: this.settings.animation.slides.easing,
                        delay: (t,i,total) => dir === 'next' ? i*100+100 : (total-i-1)*100+100,
                        translateY: [dir === 'next' ? 100 : -100 ,0],
                        opacity: [0,1]
                    });
                });
            };

            const animateShapeOut = () => {
                anime({
                    targets: this.DOM.shape,
                    duration: this.settings.animation.shape.duration,
                    //delay: 100,
                    easing: this.settings.animation.shape.easing.out,
                    d: this.paths.initial,
                    complete: () => this.isAnimating = false
                });
            }

            animateShapeIn.finished.then(animateSlides).then(animateShapeOut);
        }
    };

    new Slideshow(document.querySelector('.animated-frame-slideshow-4 .slideshow'));
    imagesLoaded('.animated-frame-slideshow-4 .slide__img', { background: true }, () => document.body.classList.remove('loading'));
	
	var my_slide4 = new Slideshow(document.querySelector('.animated-frame-slideshow-4 .slideshow'));
	imagesLoaded('.animated-frame-slideshow-4 .slide__img', { background: true }, () => document.body.classList.remove('loading'));

	setInterval(function(){
	my_slide4.navigate('next');
	},5000);
};



{

	function debounce(func, wait, immediate) {
		var timeout;
		return function() {
			var context = this, args = arguments;
			var later = function() {
				timeout = null;
				if (!immediate) func.apply(context, args);
			};
			var callNow = immediate && !timeout;
			clearTimeout(timeout);
			timeout = setTimeout(later, wait);
			if (callNow) func.apply(context, args);
		};
    };
    
    class Slideshow {
        constructor(el) {
            this.DOM = {};
            this.DOM.el = el;
            this.settings = {
                animation: {
                    slides: {
                        duration: 600,
                        easing: 'easeOutQuint'
                    },
                    shape: {
                        duration: 300,
                        easing: {in: 'easeOutQuint', out: 'easeOutQuad'}
                    }
                },
                frameFill: 'url(#pattern)'
            }
            this.init();
        }
        init() {
            this.DOM.slides = Array.from(this.DOM.el.querySelectorAll('.animated-frame-slideshow-5 .slides > .slide'));
            this.slidesTotal = this.DOM.slides.length;
            this.DOM.nav = this.DOM.el.querySelector('.animated-frame-slideshow-5 .slidenav');
            this.DOM.nextCtrl = this.DOM.nav.querySelector('.animated-frame-slideshow-5 .slidenav__item--next');
            this.DOM.prevCtrl = this.DOM.nav.querySelector('.animated-frame-slideshow-5 .slidenav__item--prev');
            this.current = 0;
            this.createFrame(); 
            this.initEvents();
        }
        createFrame() {
            this.rect = this.DOM.el.getBoundingClientRect();
            this.frameSize = this.rect.width/12;
            this.paths = {
                initial: this.calculatePath('initial'),
                final: this.calculatePath('final')
            };
            this.DOM.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            this.DOM.svg.setAttribute('class', 'shape');
            this.DOM.svg.setAttribute('width','100%');
            this.DOM.svg.setAttribute('height','100%');
            this.DOM.svg.setAttribute('viewbox',`0 0 ${this.rect.width} ${this.rect.height}`);
            this.DOM.svg.innerHTML = `
            <defs>
            <pattern fill="#000" id="pattern" width="40" height="40" patternUnits="userSpaceOnUse">
            <polygon id="Path-2" points="0 40 40 0 20 0 0 20"></polygon>
            <polygon id="Path-2-Copy" points="40 40 40 20 20 40"></polygon>
            </pattern>
            </defs>
            <path fill="${this.settings.frameFill}" d="${this.paths.initial}"/>
            `;
            this.DOM.el.insertBefore(this.DOM.svg, this.DOM.nav);
            this.DOM.shape = this.DOM.svg.lastElementChild;
        }
        updateFrame() {
            this.paths.initial = this.calculatePath('initial');
            this.paths.final = this.calculatePath('final');
            this.DOM.svg.setAttribute('viewbox',`0 0 ${this.rect.width} ${this.rect.height}`);
            this.DOM.shape.setAttribute('d', this.isAnimating ? this.paths.final : this.paths.initial);
        }
        calculatePath(path = 'initial') {
            return path === 'initial' ?
                `M 0,0 0,${this.rect.height} ${this.rect.width},${this.rect.height} ${this.rect.width},0 0,0 Z M 0,0 ${this.rect.width},0 ${this.rect.width},${this.rect.height} 0,${this.rect.height} Z` :
                `M 0,0 0,${this.rect.height} ${this.rect.width},${this.rect.height} ${this.rect.width},0 0,0 Z M ${this.frameSize},${this.frameSize} ${this.rect.width-this.frameSize},${this.frameSize/2} ${this.rect.width-this.frameSize-100},${this.rect.height-this.frameSize/3} ${this.frameSize+50},${this.rect.height-this.frameSize-30} Z`
        }
        initEvents() {
            this.DOM.nextCtrl.addEventListener('click', () => this.navigate('next'));
            this.DOM.prevCtrl.addEventListener('click', () => this.navigate('prev'));
            
            window.addEventListener('resize', debounce(() => {
                this.rect = this.DOM.el.getBoundingClientRect();
                this.updateFrame();
            }, 20));
            
            document.addEventListener('keydown', (ev) => {
                const keyCode = ev.keyCode || ev.which;
                if ( keyCode === 37 ) {
                    this.navigate('prev');
                }
                else if ( keyCode === 39 ) {
                    this.navigate('next');
                }
            });
        }
        navigate(dir = 'next') {
            if ( this.isAnimating ) return false;
            this.isAnimating = true;

            const animateShapeIn = anime({
                targets: this.DOM.shape,
                duration: this.settings.animation.shape.duration,
                easing: this.settings.animation.shape.easing.in,
                d: this.paths.final
            });

            const animateSlides = () => {
                return new Promise((resolve, reject) => {
                    const currentSlide = this.DOM.slides[this.current];
                    anime({
                        targets: currentSlide,
                        duration: this.settings.animation.slides.duration,
                        easing: this.settings.animation.slides.easing,
                        translateX: dir === 'next' ? -1*this.rect.width : this.rect.width,
                        complete: () => {
                            currentSlide.classList.remove('slide--current');
                            resolve();
                        }
                    });
        
                    this.current = dir === 'next' ? 
                        this.current < this.slidesTotal-1 ? this.current + 1 : 0 :
                        this.current > 0 ? this.current - 1 : this.slidesTotal-1; 
                    
                    const newSlide = this.DOM.slides[this.current];
                    newSlide.classList.add('slide--current');
                    anime({
                        targets: newSlide,
                        duration: this.settings.animation.slides.duration,
                        easing: this.settings.animation.slides.easing,
                        translateX: [dir === 'next' ? this.rect.width : -1*this.rect.width,0]
                    });
        
                    const newSlideImg = newSlide.querySelector('.animated-frame-slideshow-5 .slide__img');
                    anime.remove(newSlideImg);
                    anime({
                        targets: newSlideImg,
                        duration: this.settings.animation.slides.duration*2,
                        easing: this.settings.animation.slides.easing,
                        translateX: [dir === 'next' ? 200 : -200, 0],
                        translateY: [dir === 'next' ? 200 : -200, 0],
                        scale: [1.2,1]
                    });
        
                    anime({
                        targets: [newSlide.querySelector('.animated-frame-slideshow-5 .slide__title'), newSlide.querySelector('.animated-frame-slideshow-5 .slide__desc'), newSlide.querySelector('.animated-frame-slideshow-5 .slide__link')],
                        duration: this.settings.animation.slides.duration*2,
                        easing: this.settings.animation.slides.easing,
                        delay: (t,i,total) => dir === 'next' ? i*100 : (total-i-1)*100,
                        translateX: [dir === 'next' ? 300 : -300,0],
                        translateY: [dir === 'next' ? 300 : -300,0],
                        opacity: [0,1]
                    });
                });
            };

            const animateShapeOut = () => {
                anime({
                    targets: this.DOM.shape,
                    duration: this.settings.animation.shape.duration,
                    delay: 150,
                    easing: this.settings.animation.shape.easing.out,
                    d: this.paths.initial,
                    complete: () => this.isAnimating = false
                });
            }

            animateShapeIn.finished.then(animateSlides).then(animateShapeOut);
        }
    };

    new Slideshow(document.querySelector('.animated-frame-slideshow-5 .slideshow'));
    imagesLoaded('.animated-frame-slideshow-5 .slide__img', { background: true }, () => document.body.classList.remove('loading'));
	
	var my_slide5 = new Slideshow(document.querySelector('.animated-frame-slideshow-5 .slideshow'));
	imagesLoaded('.animated-frame-slideshow-5 .slide__img', { background: true }, () => document.body.classList.remove('loading'));

	setInterval(function(){
	my_slide5.navigate('next');
	},5000);
};



{
	function debounce(func, wait, immediate) {
		var timeout;
		return function() {
			var context = this, args = arguments;
			var later = function() {
				timeout = null;
				if (!immediate) func.apply(context, args);
			};
			var callNow = immediate && !timeout;
			clearTimeout(timeout);
			timeout = setTimeout(later, wait);
			if (callNow) func.apply(context, args);
		};
    };
    
    class Slideshow {
        constructor(el) {
            this.DOM = {};
            this.DOM.el = el;
            this.settings = {
                animation: {
                    slides: {
                        duration: 500,
                        easing: 'easeOutQuint'
                    },
                    shape: {
                        duration: 300,
                        easing: {in: 'easeOutQuint', out: 'easeOutQuad'}
                    }
                },
                frameFill: 'url(#gradient1)'
            }
            this.init();
        }
        init() {
            this.DOM.slides = Array.from(this.DOM.el.querySelectorAll('.animated-frame-slideshow-6 .slides--images > .slide'));
            this.slidesTotal = this.DOM.slides.length;
            this.DOM.nav = this.DOM.el.querySelector('.animated-frame-slideshow-6 .slidenav');
            this.DOM.titles = this.DOM.el.querySelector('.animated-frame-slideshow-6 .slides--titles');
            this.DOM.titlesSlides = Array.from(this.DOM.titles.querySelectorAll('.animated-frame-slideshow-6 .slide'));
            this.DOM.nextCtrl = this.DOM.nav.querySelector('.animated-frame-slideshow-6 .slidenav__item--next');
            this.DOM.prevCtrl = this.DOM.nav.querySelector('.animated-frame-slideshow-6 .slidenav__item--prev');
            this.current = 0;
            this.createFrame(); 
            this.initEvents();
        }
        createFrame() {
            this.rect = this.DOM.el.getBoundingClientRect();
            this.frameSize = this.rect.width/12;
            this.paths = {
                initial: this.calculatePath('initial'),
                final: this.calculatePath('final')
            };
            this.DOM.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            this.DOM.svg.setAttribute('class', 'shape');
            this.DOM.svg.setAttribute('width','100%');
            this.DOM.svg.setAttribute('height','100%');
            this.DOM.svg.setAttribute('viewbox',`0 0 ${this.rect.width} ${this.rect.height}`);
            this.DOM.svg.innerHTML = `
            <defs>
            <linearGradient id="gradient1" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#09012d"/>
                <stop offset="100%" stop-color="#0f2b73"/>
            </linearGradient>
            </defs>
            <path fill="${this.settings.frameFill}" d="${this.paths.initial}"/>`;
            this.DOM.el.insertBefore(this.DOM.svg, this.DOM.titles);
            this.DOM.shape = this.DOM.svg.querySelector('path');
        }
        updateFrame() {
            this.paths.initial = this.calculatePath('initial');
            this.paths.final = this.calculatePath('final');
            this.DOM.svg.setAttribute('viewbox',`0 0 ${this.rect.width} ${this.rect.height}`);
            this.DOM.shape.setAttribute('d', this.isAnimating ? this.paths.final : this.paths.initial);
        }
        calculatePath(path = 'initial') {

            if ( path === 'initial' ) {
                return `M 0,0 0,${this.rect.height} ${this.rect.width},${this.rect.height} ${this.rect.width},0 0,0 Z M 0,0 ${this.rect.width},0 ${this.rect.width},${this.rect.height} 0,${this.rect.height} Z`;
            }
            else {
                const point1 = {x: this.rect.width/4-50, y: this.rect.height/4+50};
                const point2 = {x: this.rect.width/4+50, y: this.rect.height/4-50};
                const point3 = {x: this.rect.width-point2.x, y: this.rect.height-point2.y};
                const point4 = {x: this.rect.width-point1.x, y: this.rect.height-point1.y};

                return `M 0,0 0,${this.rect.height} ${this.rect.width},${this.rect.height} ${this.rect.width},0 0,0 Z M ${point1.x},${point1.y} ${point2.x},${point2.y} ${point4.x},${point4.y} ${point3.x},${point3.y} Z`;
            }
        }
        initEvents() {
            this.DOM.nextCtrl.addEventListener('click', () => this.navigate('next'));
            this.DOM.prevCtrl.addEventListener('click', () => this.navigate('prev'));
            
            window.addEventListener('resize', debounce(() => {
                this.rect = this.DOM.el.getBoundingClientRect();
                this.updateFrame();
            }, 20));
            
            document.addEventListener('keydown', (ev) => {
                const keyCode = ev.keyCode || ev.which;
                if ( keyCode === 37 ) {
                    this.navigate('prev');
                }
                else if ( keyCode === 39 ) {
                    this.navigate('next');
                }
            });
        }
        navigate(dir = 'next') {
            if ( this.isAnimating ) return false;
            this.isAnimating = true;

            const animateShapeIn = anime({
                targets: this.DOM.shape,
                duration: this.settings.animation.shape.duration,
                easing: this.settings.animation.shape.easing.in,
                d: this.paths.final
            });

            const animateSlides = () => {
                return new Promise((resolve, reject) => {
                    const currentSlide = this.DOM.slides[this.current];
                    anime({
                        targets: currentSlide,
                        duration: this.settings.animation.slides.duration,
                        easing: this.settings.animation.slides.easing,
                        translateY: dir === 'next' ? this.rect.height : -1*this.rect.height,
                        complete: () => {
                            currentSlide.classList.remove('slide--current');
                            resolve();
                        }
                    });

                    const currentTitleSlide = this.DOM.titlesSlides[this.current];
                    anime({
                        targets: currentTitleSlide.children,
                        duration: this.settings.animation.slides.duration,
                        easing: this.settings.animation.slides.easing,
                        delay: (t,i,total) => dir === 'next' ? i*100 : (total-i-1)*100,
                        translateY: [0, dir === 'next' ? 100 : -100],
                        opacity: [1,0],
                        complete: () => {
                            currentTitleSlide.classList.remove('slide--current');
                            resolve();
                        }
                    });
        
                    this.current = dir === 'next' ? 
                        this.current < this.slidesTotal-1 ? this.current + 1 : 0 :
                        this.current > 0 ? this.current - 1 : this.slidesTotal-1; 
                    
                    const newSlide = this.DOM.slides[this.current];
                    newSlide.classList.add('slide--current');
                    anime({
                        targets: newSlide,
                        duration: this.settings.animation.slides.duration,
                        easing: this.settings.animation.slides.easing,
                        translateY: [dir === 'next' ? -1*this.rect.height : this.rect.height,0]
                    });
        
                    const newSlideImg = newSlide.querySelector('.slide__img');
                    
                    anime.remove(newSlideImg);
                    anime({
                        targets: newSlideImg,
                        duration: this.settings.animation.slides.duration*3,
                        easing: this.settings.animation.slides.easing,
                        translateY: [dir === 'next' ? -100 : 100, 0],
                        scale: [0.2,1]
                    });
                    
                    const newTitleSlide = this.DOM.titlesSlides[this.current];
                    newTitleSlide.classList.add('slide--current');
                    anime({
                        targets: newTitleSlide.children,
                        duration: this.settings.animation.slides.duration*1.5,
                        easing: this.settings.animation.slides.easing,
                        delay: (t,i,total) => dir === 'next' ? i*100+100 : (total-i-1)*100+100,
                        translateY: [dir === 'next' ? -100 : 100 ,0],
                        opacity: [0,1]
                    });
                });
            };

            const animateShapeOut = () => {
                anime({
                    targets: this.DOM.shape,
                    duration: this.settings.animation.shape.duration,
                    easing: this.settings.animation.shape.easing.out,
                    d: this.paths.initial,
                    complete: () => this.isAnimating = false
                });
            }

            animateShapeIn.finished.then(animateSlides).then(animateShapeOut);
        }
    };

    new Slideshow(document.querySelector('.animated-frame-slideshow-6 .slideshow'));
    imagesLoaded('.animated-frame-slideshow-6 .slide__img', { background: true }, () => document.body.classList.remove('loading'));
	
	var my_slide = new Slideshow(document.querySelector('.animated-frame-slideshow-6 .slideshow'));
	imagesLoaded('.animated-frame-slideshow-6 .slide__img', { background: true }, () => document.body.classList.remove('loading'));

	setInterval(function(){
	my_slide.navigate('next');
	},5000);
};


