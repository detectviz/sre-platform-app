import { createContext, ReactNode, useCallback, useContext, useMemo, useReducer } from 'react';
import { logging } from '@core/services/logging';

export interface NavigationLink {
  id: string;
  path: string;
  titleKey: string;
  icon?: string;
  children?: NavigationLink[];
  order?: number;
  resource?: string;
  action?: string;
}

interface NavigationState {
  items: NavigationLink[];
}

const initialState: NavigationState = { items: [] };

type Action =
  | { type: 'register'; payload: NavigationLink[] }
  | { type: 'unregister'; payload: { id: string } };

function reducer(state: NavigationState, action: Action): NavigationState {
  switch (action.type) {
    case 'register': {
      const merged = [...state.items];
      action.payload.forEach((incoming) => {
        const idx = merged.findIndex((item) => item.id === incoming.id);
        if (idx >= 0) {
          merged[idx] = incoming;
        } else {
          merged.push(incoming);
        }
      });
      return { items: merged.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)) };
    }
    case 'unregister': {
      return { items: state.items.filter((item) => item.id !== action.payload.id) };
    }
    default:
      return state;
  }
}

interface NavigationContextValue extends NavigationState {
  register: (links: NavigationLink[]) => void;
  unregister: (id: string) => void;
}

const NavigationContext = createContext<NavigationContextValue | undefined>(undefined);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const register = useCallback((links: NavigationLink[]) => {
    logging.info('navigation:register', {
      module: 'core.navigation',
      scope: 'register',
      context: { count: links.length },
    });
    dispatch({ type: 'register', payload: links });
  }, []);

  const unregister = useCallback((id: string) => {
    logging.info('navigation:unregister', {
      module: 'core.navigation',
      scope: id,
    });
    dispatch({ type: 'unregister', payload: { id } });
  }, []);

  const value = useMemo(
    () => ({
      items: state.items,
      register,
      unregister,
    }),
    [register, state.items, unregister]
  );

  return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>;
}

export function useNavigation() {
  const ctx = useContext(NavigationContext);
  if (!ctx) {
    throw new Error('NavigationContext not found');
  }
  return ctx;
}
