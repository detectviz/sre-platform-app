// This is not a React component, but a utility to manage toasts.
// It injects HTML directly into the body.

const createToastContainer = (): HTMLElement => {
    let container = document.getElementById('global-toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'global-toast-container';
        container.className = 'fixed top-5 right-5 z-[9999] space-y-2 w-96';
        document.body.appendChild(container);
    }
    return container;
};

export const showToast = (message: string, type: 'error' | 'success' | 'warning' | 'info' = 'error') => {
    const container = createToastContainer();

    const toast = document.createElement('div');
    const typeClasses = type === 'error'
        ? 'bg-red-900/80 border-red-700/80 text-red-200'
        : type === 'warning'
            ? 'bg-orange-900/80 border-orange-700/80 text-orange-200'
            : type === 'info'
                ? 'bg-blue-900/80 border-blue-700/80 text-blue-200'
                : 'bg-green-900/80 border-green-700/80 text-green-200';

    toast.className = `flex items-center p-4 rounded-lg shadow-2xl border backdrop-blur-md`;
    toast.classList.add(...typeClasses.split(' '));

    // --- Transition logic ---
    toast.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';
    // Initial state (off-screen to the right)
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';

    const iconName = type === 'error' ? 'alert-circle' : type === 'warning' ? 'alert-triangle' : type === 'info' ? 'info' : 'check-circle';
    const iconColor = type === 'error' ? 'text-red-400' : type === 'warning' ? 'text-orange-400' : type === 'info' ? 'text-blue-400' : 'text-green-400';

    toast.innerHTML = `
        <i data-lucide="${iconName}" class="w-5 h-5 mr-3 shrink-0 ${iconColor}"></i>
        <span class="flex-grow">${message}</span>
        <button class="ml-4 p-1 rounded-full text-slate-400 hover:bg-slate-700 hover:text-white shrink-0">
          <i data-lucide="x" class="w-4 h-4"></i>
        </button>
    `;

    const hideAndRemove = () => {
        // Prevent multiple calls
        if (toast.dataset.hiding) return;
        toast.dataset.hiding = 'true';

        clearTimeout(hideTimeout);
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)'; // Slide out to the right
        toast.addEventListener('transitionend', () => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, { once: true });
    };

    const closeButton = toast.querySelector('button');
    closeButton?.addEventListener('click', hideAndRemove);

    const hideTimeout = setTimeout(hideAndRemove, 3500);

    container.prepend(toast);

    // @ts-ignore
    if (window.lucide) {
        // @ts-ignore
        window.lucide.createIcons({
            nodes: [toast]
        });
    }

    // Trigger fade-in transition
    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(0)';
    }, 10);
};
