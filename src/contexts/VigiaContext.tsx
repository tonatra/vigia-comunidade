import React, { createContext, useContext, useState, useEffect } from 'react';

export type CaseStatus = 'pending' | 'in_progress' | 'resolved' | 'rejected';
export type CasePriority = 'low' | 'medium' | 'high' | 'critical';
export type CaseCategory = 'water' | 'road' | 'sewage' | 'energy' | 'other';

export interface Case {
  id: string;
  title: string;
  description: string;
  category: CaseCategory;
  status: CaseStatus;
  priority: CasePriority;
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  image?: string;
  iir: number;
  supports: number;
  createdAt: string;
  updatedAt: string;
  userId: string;
  userName: string;
}

export interface Comment {
  id: string;
  caseId: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: string;
}

interface VigiaContextType {
  cases: Case[];
  comments: Comment[];
  currentUser: { id: string; name: string; isAdmin: boolean } | null;
  addCase: (caseData: Omit<Case, 'id' | 'createdAt' | 'updatedAt' | 'supports' | 'userId' | 'userName'>) => void;
  updateCase: (id: string, updates: Partial<Case>) => void;
  deleteCase: (id: string) => void;
  supportCase: (id: string) => void;
  addComment: (caseId: string, text: string) => void;
  login: (name: string, isAdmin: boolean) => void;
  logout: () => void;
}

const VigiaContext = createContext<VigiaContextType | undefined>(undefined);

export const VigiaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cases, setCases] = useState<Case[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string; isAdmin: boolean } | null>(null);

  useEffect(() => {
    const storedCases = localStorage.getItem('vigia_cases');
    const storedComments = localStorage.getItem('vigia_comments');
    const storedUser = localStorage.getItem('vigia_user');

    if (storedCases) setCases(JSON.parse(storedCases));
    if (storedComments) setComments(JSON.parse(storedComments));
    if (storedUser) setCurrentUser(JSON.parse(storedUser));
  }, []);

  useEffect(() => {
    localStorage.setItem('vigia_cases', JSON.stringify(cases));
  }, [cases]);

  useEffect(() => {
    localStorage.setItem('vigia_comments', JSON.stringify(comments));
  }, [comments]);

  const addCase = (caseData: Omit<Case, 'id' | 'createdAt' | 'updatedAt' | 'supports' | 'userId' | 'userName'>) => {
    if (!currentUser) return;
    
    const newCase: Case = {
      ...caseData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      supports: 0,
      userId: currentUser.id,
      userName: currentUser.name,
    };
    
    setCases(prev => [newCase, ...prev]);
  };

  const updateCase = (id: string, updates: Partial<Case>) => {
    setCases(prev =>
      prev.map(c => (c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c))
    );
  };

  const deleteCase = (id: string) => {
    setCases(prev => prev.filter(c => c.id !== id));
    setComments(prev => prev.filter(c => c.caseId !== id));
  };

  const supportCase = (id: string) => {
    setCases(prev =>
      prev.map(c => (c.id === id ? { ...c, supports: c.supports + 1 } : c))
    );
  };

  const addComment = (caseId: string, text: string) => {
    if (!currentUser) return;
    
    const newComment: Comment = {
      id: crypto.randomUUID(),
      caseId,
      userId: currentUser.id,
      userName: currentUser.name,
      text,
      createdAt: new Date().toISOString(),
    };
    
    setComments(prev => [...prev, newComment]);
  };

  const login = (name: string, isAdmin: boolean) => {
    const user = {
      id: crypto.randomUUID(),
      name,
      isAdmin,
    };
    setCurrentUser(user);
    localStorage.setItem('vigia_user', JSON.stringify(user));
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('vigia_user');
  };

  return (
    <VigiaContext.Provider
      value={{
        cases,
        comments,
        currentUser,
        addCase,
        updateCase,
        deleteCase,
        supportCase,
        addComment,
        login,
        logout,
      }}
    >
      {children}
    </VigiaContext.Provider>
  );
};

export const useVigia = () => {
  const context = useContext(VigiaContext);
  if (!context) throw new Error('useVigia must be used within VigiaProvider');
  return context;
};
