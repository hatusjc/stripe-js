/**
 * CreatorHub - Main JavaScript
 * Handles: dark mode, mobile nav, scroll behaviors, interactions
 */

(function () {
    'use strict';

    /* =========================================================
       DARK MODE
       ========================================================= */
    const DarkMode = {
        KEY: 'ch-theme',

        init() {
            const saved = localStorage.getItem(this.KEY);
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const theme = saved || (prefersDark ? 'dark' : 'light');
            this.apply(theme);
            this.bindToggle();

            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                if (!localStorage.getItem(this.KEY)) {
                    this.apply(e.matches ? 'dark' : 'light');
                }
            });
        },

        apply(theme) {
            document.documentElement.setAttribute('data-theme', theme);
            document.body.classList.toggle('dark-mode', theme === 'dark');
            this.updateToggleIcon(theme);
        },

        toggle() {
            const current = document.documentElement.getAttribute('data-theme') || 'light';
            const next = current === 'dark' ? 'light' : 'dark';
            localStorage.setItem(this.KEY, next);
            this.apply(next);
        },

        bindToggle() {
            document.querySelectorAll('.ch-darkmode-toggle, [data-darkmode-toggle]').forEach(btn => {
                btn.addEventListener('click', () => this.toggle());
            });
        },

        updateToggleIcon(theme) {
            const icons = document.querySelectorAll('.ch-darkmode-toggle .ch-icon-sun, .ch-darkmode-toggle .ch-icon-moon');
            icons.forEach(icon => {
                if (theme === 'dark') {
                    icon.classList.toggle('ch-hidden', icon.classList.contains('ch-icon-moon'));
                } else {
                    icon.classList.toggle('ch-hidden', icon.classList.contains('ch-icon-sun'));
                }
            });
        }
    };

    /* =========================================================
       MOBILE NAVIGATION
       ========================================================= */
    const MobileNav = {
        init() {
            const toggle = document.querySelector('.ch-menu-toggle');
            const nav = document.querySelector('.ch-mobile-nav');
            const close = document.querySelector('.ch-mobile-nav__close');

            if (!toggle || !nav) return;

            toggle.addEventListener('click', () => this.open(nav, toggle));
            close?.addEventListener('click', () => this.close(nav, toggle));

            nav.addEventListener('click', (e) => {
                if (e.target === nav) this.close(nav, toggle);
            });

            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && nav.classList.contains('is-open')) {
                    this.close(nav, toggle);
                }
            });
        },

        open(nav, toggle) {
            nav.classList.add('is-open');
            document.body.style.overflow = 'hidden';
            toggle.setAttribute('aria-expanded', 'true');
        },

        close(nav, toggle) {
            nav.classList.remove('is-open');
            document.body.style.overflow = '';
            toggle.setAttribute('aria-expanded', 'false');
        }
    };

    /* =========================================================
       SCROLL BEHAVIORS
       ========================================================= */
    const ScrollBehavior = {
        init() {
            this.initScrollTop();
            this.initStickyHeader();
        },

        initScrollTop() {
            const btn = document.querySelector('.ch-scroll-top');
            if (!btn) return;

            window.addEventListener('scroll', () => {
                btn.classList.toggle('is-visible', window.scrollY > 400);
            }, { passive: true });

            btn.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        },

        initStickyHeader() {
            const header = document.querySelector('.ch-header');
            if (!header) return;

            let lastScroll = 0;

            window.addEventListener('scroll', () => {
                const current = window.scrollY;

                if (current > 100) {
                    header.classList.add('is-scrolled');
                } else {
                    header.classList.remove('is-scrolled');
                }

                // Hide on scroll down, show on scroll up
                if (current > lastScroll && current > 200) {
                    header.classList.add('is-hidden');
                } else {
                    header.classList.remove('is-hidden');
                }

                lastScroll = current;
            }, { passive: true });
        }
    };

    /* =========================================================
       PROFILE TABS
       ========================================================= */
    const ProfileTabs = {
        init() {
            const tabs = document.querySelectorAll('.ch-profile__tab');
            if (!tabs.length) return;

            tabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    const target = tab.dataset.tab;

                    tabs.forEach(t => t.classList.remove('is-active'));
                    tab.classList.add('is-active');

                    document.querySelectorAll('[data-tab-panel]').forEach(panel => {
                        panel.classList.toggle('ch-hidden', panel.dataset.tabPanel !== target);
                    });
                });
            });
        }
    };

    /* =========================================================
       FOLLOW / SUBSCRIBE BUTTONS
       ========================================================= */
    const CreatorActions = {
        init() {
            document.querySelectorAll('[data-follow-btn]').forEach(btn => {
                btn.addEventListener('click', () => this.handleFollow(btn));
            });

            document.querySelectorAll('[data-like-btn]').forEach(btn => {
                btn.addEventListener('click', () => this.handleLike(btn));
            });
        },

        handleFollow(btn) {
            const following = btn.classList.toggle('is-following');
            const countEl = document.querySelector('[data-follow-count]');
            const count = parseInt(countEl?.textContent?.replace(/[^\d]/g, '') || '0');

            btn.textContent = following ? btn.dataset.followingLabel || 'Seguindo' : btn.dataset.followLabel || 'Seguir';
            if (countEl) countEl.textContent = this.formatNumber(following ? count + 1 : count - 1);

            this.sendAjax('ch_toggle_follow', {
                creator_id: btn.dataset.creatorId,
                follow: following ? 1 : 0
            });
        },

        handleLike(btn) {
            const liked = btn.classList.toggle('is-liked');
            const countEl = btn.querySelector('.ch-like-count');
            const count = parseInt(countEl?.textContent || '0');
            if (countEl) countEl.textContent = liked ? count + 1 : Math.max(0, count - 1);

            this.sendAjax('ch_toggle_like', {
                post_id: btn.dataset.postId,
                like: liked ? 1 : 0
            });
        },

        sendAjax(action, data) {
            if (typeof chAjax === 'undefined') return;
            fetch(chAjax.ajaxUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({ action, nonce: chAjax.nonce, ...data })
            }).catch(console.error);
        },

        formatNumber(n) {
            if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
            if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
            return n.toString();
        }
    };

    /* =========================================================
       INFINITE SCROLL / LOAD MORE
       ========================================================= */
    const LoadMore = {
        init() {
            const btn = document.querySelector('[data-load-more]');
            if (!btn) return;

            btn.addEventListener('click', () => this.loadPosts(btn));
        },

        async loadPosts(btn) {
            if (btn.classList.contains('is-loading')) return;

            btn.classList.add('is-loading');
            btn.textContent = btn.dataset.loadingText || 'Carregando...';

            try {
                const page = parseInt(btn.dataset.page || '1') + 1;
                const response = await fetch(chAjax.ajaxUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: new URLSearchParams({
                        action: 'ch_load_more_posts',
                        nonce: chAjax.nonce,
                        page,
                        query_vars: btn.dataset.queryVars || ''
                    })
                });

                const data = await response.json();

                if (data.success && data.data.html) {
                    const container = document.querySelector('[data-posts-container]');
                    container?.insertAdjacentHTML('beforeend', data.data.html);
                    btn.dataset.page = page;

                    if (!data.data.has_more) {
                        btn.style.display = 'none';
                    }
                }
            } catch (e) {
                console.error('Load more failed:', e);
            } finally {
                btn.classList.remove('is-loading');
                btn.textContent = btn.dataset.loadText || 'Carregar mais';
            }
        }
    };

    /* =========================================================
       DASHBOARD SIDEBAR TOGGLE (mobile)
       ========================================================= */
    const DashboardSidebar = {
        init() {
            const toggle = document.querySelector('[data-sidebar-toggle]');
            const sidebar = document.querySelector('.ch-dashboard__sidebar');
            if (!toggle || !sidebar) return;

            toggle.addEventListener('click', () => {
                sidebar.classList.toggle('is-open');
            });

            document.addEventListener('click', (e) => {
                if (!sidebar.contains(e.target) && !toggle.contains(e.target)) {
                    sidebar.classList.remove('is-open');
                }
            });
        }
    };

    /* =========================================================
       MEDIA LIGHTBOX (basic)
       ========================================================= */
    const Lightbox = {
        init() {
            document.querySelectorAll('[data-lightbox]').forEach(trigger => {
                trigger.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.open(trigger.href || trigger.dataset.src, trigger.dataset.type || 'image');
                });
            });
        },

        open(src, type) {
            const overlay = document.createElement('div');
            overlay.className = 'ch-lightbox';
            overlay.innerHTML = `
                <div class="ch-lightbox__backdrop"></div>
                <div class="ch-lightbox__inner">
                    <button class="ch-lightbox__close" aria-label="Fechar">&times;</button>
                    ${type === 'video'
                        ? `<video src="${src}" controls autoplay class="ch-lightbox__media"></video>`
                        : `<img src="${src}" alt="" class="ch-lightbox__media">`
                    }
                </div>
            `;

            document.body.appendChild(overlay);
            document.body.style.overflow = 'hidden';

            overlay.querySelector('.ch-lightbox__backdrop').addEventListener('click', () => this.close(overlay));
            overlay.querySelector('.ch-lightbox__close').addEventListener('click', () => this.close(overlay));
            document.addEventListener('keydown', (e) => e.key === 'Escape' && this.close(overlay), { once: true });
        },

        close(overlay) {
            overlay.remove();
            document.body.style.overflow = '';
        }
    };

    /* =========================================================
       TOAST NOTIFICATIONS
       ========================================================= */
    window.chToast = {
        show(message, type = 'info', duration = 4000) {
            let container = document.querySelector('.ch-toast-container');
            if (!container) {
                container = document.createElement('div');
                container.className = 'ch-toast-container';
                document.body.appendChild(container);
            }

            const icons = {
                success: '✓',
                error: '✕',
                warning: '!',
                info: 'ℹ'
            };

            const colors = {
                success: 'var(--ch-success)',
                error: 'var(--ch-error)',
                warning: 'var(--ch-warning)',
                info: 'var(--ch-primary)'
            };

            const toast = document.createElement('div');
            toast.className = 'ch-toast';
            toast.innerHTML = `
                <span style="width:20px;height:20px;background:${colors[type]};border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-size:12px;font-weight:bold;flex-shrink:0">${icons[type]}</span>
                <span style="font-size:0.875rem;color:var(--ch-text)">${message}</span>
            `;

            container.appendChild(toast);

            setTimeout(() => {
                toast.style.animation = 'toastOut 0.3s ease forwards';
                setTimeout(() => toast.remove(), 300);
            }, duration);
        }
    };

    /* =========================================================
       INIT
       ========================================================= */
    document.addEventListener('DOMContentLoaded', () => {
        DarkMode.init();
        MobileNav.init();
        ScrollBehavior.init();
        ProfileTabs.init();
        CreatorActions.init();
        LoadMore.init();
        DashboardSidebar.init();
        Lightbox.init();
    });

})();
