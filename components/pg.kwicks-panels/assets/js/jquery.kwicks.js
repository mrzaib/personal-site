/*!
 *  Kwicks: Sexy Sliding Panels for jQuery - v2.2.1
 *  http://devsmash.com/projects/kwicks
 *
 *  Copyright 2013 Jeremy Martin (jmar777)
 *  Contributors: Duke Speer (Duke3D), Guillermo Guerrero (gguerrero)
 *  Released under the MIT license
 *  http://www.opensource.org/licenses/mit-license.php
 */  
			$(function() {
         
                if ($.fn.kwicks) {
                    $('.kwicks').kwicks({
                        maxSize : '75%',
                        behavior: 'menu',
                        spacing: '6px',
                        duration: 500
                    });
                }
            });

! function(a) {
    var b = {
        init: function(b) {
            var d = {
                    maxSize: -1,
                    minSize: -1,
                    spacing: 5,
                    duration: 500,
                    isVertical: !1,
                    easing: void 0,
                    autoResize: !0,
                    behavior: null,
                    delayMouseIn: 0,
                    delayMouseOut: 0,
                    selectOnClick: !0,
                    deselectOnClick: !1,
                    interval: 2500,
                    interactive: !0
                },
                e = a.extend(d, b);
            if (-1 !== e.minSize && -1 !== e.maxSize) throw new Error("Kwicks options minSize and maxSize may not both be set");
            if (e.behavior && "menu" !== e.behavior && "slideshow" !== e.behavior) throw new Error("Unrecognized Kwicks behavior specified: " + e.behavior);
            return a.each(["minSize", "maxSize", "spacing"], function(a, b) {
                var c = e[b];
                switch (typeof c) {
                    case "number":
                        e[b + "Units"] = "px";
                        break;
                    case "string":
                        if ("%" === c.slice(-1)) e[b + "Units"] = "%", e[b] = +c.slice(0, -1) / 100;
                        else {
                            if ("px" !== c.slice(-2)) throw new Error("Invalid value for Kwicks option " + b + ": " + c);
                            e[b + "Units"] = "px", e[b] = +c.slice(0, -2)
                        }
                        break;
                    default:
                        throw new Error("Invalid value for Kwicks option " + b + ": " + c)
                }
            }), this.each(function() {
                a(this).data("kwicks", new c(this, e))
            })
        },
        expand: function(b, c) {
            "object" == typeof b && (c = b, b = void 0);
            var d = c && c.delay || 0;
            return this.each(function() {
                var c = a(this),
                    e = c.data("kwicks");
                if (e) b = "number" == typeof b ? b : -1;
                else {
                    if (!(e = c.parent().data("kwicks"))) return;
                    b = c.index()
                }
                var f = function() {
                        if (b !== e.expandedIndex) {
                            var a = e.$panels,
                                c = a[b] || null;
                            e.$container.trigger("expand.kwicks", {
                                index: b,
                                expanded: c,
                                collapsed: a.not(c).get(),
                                oldIndex: e.expandedIndex,
                                oldExpanded: e.getExpandedPanel(),
                                isAnimated: e.isAnimated
                            })
                        }
                    },
                    g = e.$container.data("kwicks-timeout-id");
                g && (e.$container.removeData("kwicks-timeout-id"), clearTimeout(g)), d > 0 ? e.$container.data("kwicks-timeout-id", setTimeout(f, d)) : f()
            })
        },
        expanded: function() {
            var a = this.first().data("kwicks");
            if (a) return a.expandedIndex
        },
        select: function(b) {
            return this.each(function() {
                var c = a(this),
                    d = c.data("kwicks");
                if (d) b = "number" == typeof b ? b : -1;
                else {
                    if (!(d = c.parent().data("kwicks"))) return;
                    b = c.index()
                }
                if (b !== d.selectedIndex) {
                    var e = d.$panels,
                        f = e[b] || null;
                    d.$container.trigger("select.kwicks", {
                        index: b,
                        selected: f,
                        unselected: e.not(f).get(),
                        oldIndex: d.selectedIndex,
                        oldSelected: d.getSelectedPanel()
                    })
                }
                d.$container.kwicks("expand", b)
            })
        },
        selected: function() {
            var a = this.first().data("kwicks");
            if (a) return a.selectedIndex
        },
        resize: function() {
            return this.each(function() {
                var b = a(this),
                    c = b.data("kwicks");
                c && c.resize()
            })
        },
        destroy: function() {
            return this.each(function() {
                var b = a(this),
                    c = b.data("kwicks");
                c && c.destroy()
            })
        }
    };
    a.fn.kwicks = function(a) {
        if (b[a]) return b[a].apply(this, Array.prototype.slice.call(arguments, 1));
        if ("object" != typeof a && a) throw new Error("Unrecognized kwicks method: " + a);
        return b.init.apply(this, arguments)
    }, a.event.special.expand = {
        _default: function(b, c) {
            if ("kwicks" === b.namespace) {
                var d = a(b.target).data("kwicks");
                d && d.expand(c.index)
            }
        }
    }, a.event.special.select = {
        _default: function(b, c) {
            if ("kwicks" === b.namespace) {
                var d = a(b.target).data("kwicks");
                d && d.select(c.index)
            }
        }
    };
    var c = function(b, c) {
        var d = this;
        this.opts = c, this.onDestroyHandlers = [];
        var e = c.isVertical ? "vertical" : "horizontal";
        this.$container = a(b), this.$panels = this.$container.children();
        var f = ["kwicks", "kwicks-" + e];
        a.each(f, function(a) {
            d.$container.hasClass(a) || (d.$container.addClass(a), d.onDestroy(function() {
                d.$container.removeClass(a)
            }))
        }), this.selectedIndex = this.$panels.filter(".kwicks-selected").index(), this.expandedIndex = this.selectedIndex, this.primaryDimension = c.isVertical ? "height" : "width", this.secondaryDimension = c.isVertical ? "width" : "height", this.calculatePanelSizes(), this.primaryAlignment = c.isVertical ? "top" : "left", this.secondaryAlignment = c.isVertical ? "bottom" : "right", this.$timer = a({
            progress: 0
        }), this.isAnimated = !1, this.offsets = this.getOffsetsForExpanded(), this.updatePanelStyles(), this.initBehavior(), this.initWindowResizeHandler(), setTimeout(function() {
            d.updatePanelStyles()
        }, 100)
    };
    c.prototype.calculatePanelSizes = function() {
        var a = this.opts,
            b = this.getContainerSize(!0);
        this.panelSpacing = "%" === a.spacingUnits ? b * a.spacing : a.spacing;
        var c = this.$panels.length,
            d = this.panelSpacing * (c - 1),
            e = b - d;
        this.panelSize = e / c, -1 === a.minSize ? (this.panelMaxSize = -1 === a.maxSize ? 5 > c ? 2 * (b / 3) : b / 3 : "%" === a.maxSizeUnits ? e * a.maxSize : a.maxSize, this.panelMinSize = (e - this.panelMaxSize) / (c - 1)) : -1 === a.maxSize && (this.panelMinSize = "%" === a.minSizeUnits ? e * a.minSize : a.minSize, this.panelMaxSize = e - this.panelMinSize * (c - 1))
    }, c.prototype.getOffsetsForExpanded = function() {
        for (var a = this.expandedIndex, b = this.$panels.length, c = this.panelSpacing, d = this.panelSize, e = this.panelMinSize, f = this.panelMaxSize, g = [0], h = 1; b > h; h++) g[h] = -1 === a ? h * (d + c) : a >= h ? h * (e + c) : f + e * (h - 1) + h * c;
        return g
    }, c.prototype.setStyle = function() {
        return a.support.style ? function(a, b) {
            a.setAttribute("style", b)
        } : function(a, b) {
            a.style.cssText = b
        }
    }(), c.prototype.updatePanelStyles = function() {
        for (var a, b, c, d, e = this.offsets, f = this.$panels, g = this.primaryDimension, h = this.primaryAlignment, i = this.secondaryAlignment, j = this.panelSpacing, k = this.getContainerSize(), l = this._stylesInited ? "" : "position:absolute;", m = f.length; m--;) c = a, a = Math.round(e[m]), m === f.length - 1 ? (b = k - a, d = i + ":0;" + g + ":" + b + "px;") : (b = c - a - j, d = h + ":" + a + "px;" + g + ":" + b + "px;"), this.setStyle(f[m], l + d);
        this._stylesInited || (this.$container.addClass("kwicks-processed"), this._stylesInited = !0)
    }, c.prototype.initBehavior = function() {
        if (this.opts.behavior) switch (this.opts.behavior) {
            case "menu":
                this.initMenuBehavior();
                break;
            case "slideshow":
                this.initSlideshowBehavior();
                break;
            default:
                throw new Error("Unrecognized behavior option: " + this.opts.behavior)
        }
    }, c.prototype.initMenuBehavior = function() {
        var b = this,
            c = b.opts;
        this.addEventHandler(this.$container, "mouseleave", function() {
            b.$container.kwicks("expand", -1, {
                delay: c.delayMouseOut
            })
        }), this.addEventHandler(this.$panels, "mouseenter", function() {
            a(this).kwicks("expand", {
                delay: c.delayMouseIn
            })
        }), (c.selectOnClick || c.deselectOnClick) && this.addEventHandler(this.$panels, "click", function() {
            var b = a(this),
                d = b.hasClass("kwicks-selected");
            d && c.deselectOnClick ? b.parent().kwicks("select", -1) : !d && c.selectOnClick && b.kwicks("select")
        })
    }, c.prototype.initSlideshowBehavior = function() {
        var b, c = this,
            d = this.$panels.length,
            e = 0,
            f = !1,
            g = function() {
                f || (b = setInterval(function() {
                    c.$container.kwicks("expand", ++e % d)
                }, c.opts.interval), f = !0)
            },
            h = function() {
                clearInterval(b), f = !1
            };
        g(), this.onDestroy(h), this.opts.interactive && (this.addEventHandler(this.$container, "mouseenter", h), this.addEventHandler(this.$container, "mouseleave", g), this.addEventHandler(this.$panels, "mouseenter", function() {
            e = a(this).kwicks("expand").index()
        }))
    }, c.prototype.initWindowResizeHandler = function() {
        if (this.opts.autoResize) {
            var b = this,
                c = 0,
                d = !1,
                e = a(window),
                f = function(a) {
                    a || (d = !1);
                    var e = +new Date;
                    if (20 > e - c) {
                        if (d) return;
                        return setTimeout(f, 20 - (e - c)), d = !0, void 0
                    }
                    c = e, b.resize()
                };
            this.addEventHandler(e, "resize", f)
        }
    }, c.prototype.getContainerSize = function(a) {
        var b = this._containerSize;
        return (a || !b) && (b = this._containerSize = this.$container[this.primaryDimension]()), b
    }, c.prototype.getExpandedPanel = function() {
        return this.$panels[this.expandedIndex] || null
    }, c.prototype.getCollapsedPanels = function() {
        return -1 === this.expandedIndex ? [] : this.$panels.not(this.getExpandedPanel()).get()
    }, c.prototype.getSelectedPanel = function() {
        return this.$panels[this.selectedIndex] || null
    }, c.prototype.getUnselectedPanels = function() {
        return this.$panels.not(this.getSelectedPanel()).get()
    }, c.prototype.onDestroy = function(a) {
        this.onDestroyHandlers.push(a)
    }, c.prototype.addEventHandler = function(a, b, c) {
        a.on(b, c), this.onDestroy(function() {
            a.off(b, c)
        })
    }, c.prototype.destroy = function() {
        this.$timer.stop();
        for (var a = 0, b = this.onDestroyHandlers.length; b > a; a++) this.onDestroyHandlers[a]();
        this.$panels.attr("style", "").removeClass("kwicks-expanded kwicks-selected kwicks-collapsed"), this.$container.removeClass("kwicks-processed").removeData("kwicks")
    }, c.prototype.resize = function() {
        this.getContainerSize() !== this.getContainerSize(!0) && (this.calculatePanelSizes(), this.offsets = this.getOffsetsForExpanded(), this.isAnimated ? this._dirtyOffsets = !0 : this.updatePanelStyles())
    }, c.prototype.select = function(b) {
        b !== this.selectedIndex && (a(this.getSelectedPanel()).removeClass("kwicks-selected"), this.selectedIndex = b, a(this.getSelectedPanel()).addClass("kwicks-selected"))
    }, c.prototype.expand = function(b) {
        var c = this,
            d = this.expandedIndex,
            e = this.getExpandedPanel();
        if (-1 === b && (b = this.selectedIndex), b !== this.expandedIndex) {
            a(this.getExpandedPanel()).removeClass("kwicks-expanded"), a(this.getCollapsedPanels()).removeClass("kwicks-collapsed"), this.expandedIndex = b, a(this.getExpandedPanel()).addClass("kwicks-expanded"), a(this.getCollapsedPanels()).addClass("kwicks-collapsed");
            var f = this.$timer,
                g = this.$panels.length,
                h = this.offsets.slice(),
                i = this.offsets,
                j = this.getOffsetsForExpanded();
            f.stop()[0].progress = 0, this.isAnimated = !0, f.animate({
                progress: 1
            }, {
                duration: this.opts.duration,
                easing: this.opts.easing,
                step: function(a) {
                    c._dirtyOffsets && (i = c.offsets, j = c.getOffsetsForExpanded(), c._dirtyOffsets = !1), i.length = 0;
                    for (var b = 0; g > b; b++) {
                        var d = j[b],
                            e = d - (d - h[b]) * (1 - a);
                        i[b] = e
                    }
                    c.updatePanelStyles()
                },
                complete: function() {
                    c.isAnimated = !1, c.$container.trigger("expand-complete.kwicks", {
                        index: b,
                        expanded: c.getExpandedPanel(),
                        collapsed: c.getCollapsedPanels(),
                        oldIndex: d,
                        oldExpanded: e,
                        isAnimated: !1
                    })
                }
            })
        }
    }
}(jQuery);