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

export const showToast = (message: string, type: 'error' | 'success' = 'error') => {
    const container = createToastContainer();

    const toast = document.createElement('div');
    const typeClasses = type === 'error'
        ? 'bg-red-900/80 border-red-700/80 text-red-200'
        : 'bg-green-900/80 border-green-700/80 text-green-200';
    
    toast.className = `flex items-center p-4 rounded-lg shadow-2xl border backdrop-blur-md animate-fade-in-down`;
    toast.classList.add(...typeClasses.split(' '));
    toast.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';
    
    const iconName = type === 'error' ? 'alert-circle' : 'check-circle';
    const iconColor = type === 'error' ? 'text-red-400' : 'text-green-400';
    
    toast.innerHTML = `
        <i data-lucide="${iconName}" class="w-5 h-5 mr-3 shrink-0 ${iconColor}"></i>
        <span class="flex-grow">${message}</span>
    `;

    container.prepend(toast);
    
    // @ts-ignore
    if (window.lucide) {
        // @ts-ignore
        window.lucide.createIcons();
    }

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        toast.addEventListener('transitionend', () => toast.remove());
    }, 5000);
};
