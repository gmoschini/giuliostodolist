
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Checkbox } from './ui/checkbox';
import { Plus, Trash2, LogOut } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

const TodoList = () => {
  const [newTodo, setNewTodo] = useState('');
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: todos = [], isLoading } = useQuery({
    queryKey: ['todos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data as Todo[];
    }
  });

  const addTodoMutation = useMutation({
    mutationFn: async (text: string) => {
      if (!user) throw new Error("User must be logged in");
      
      const { error } = await supabase
        .from('todos')
        .insert([{ text, user_id: user.id }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      setNewTodo('');
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Errore",
        description: error.message
      });
    }
  });

  const toggleTodoMutation = useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      const { error } = await supabase
        .from('todos')
        .update({ completed })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Errore",
        description: error.message
      });
    }
  });

  const deleteTodoMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Errore",
        description: error.message
      });
    }
  });

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  const addTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTodo.trim()) {
      addTodoMutation.mutate(newTodo.trim());
    }
  };

  if (isLoading) {
    return <div className="text-center mt-8">Caricamento...</div>;
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Lista delle cose da fare</h1>
        <Button variant="ghost" size="icon" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
      
      <form onSubmit={addTodo} className="flex gap-2 mb-6">
        <Input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Aggiungi un nuovo task..."
          className="flex-1"
        />
        <Button type="submit">
          <Plus className="mr-2" />
          Aggiungi
        </Button>
      </form>

      <div className="space-y-3">
        {todos.map(todo => (
          <div
            key={todo.id}
            className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm"
          >
            <Checkbox
              checked={todo.completed}
              onCheckedChange={(checked) => 
                toggleTodoMutation.mutate({ id: todo.id, completed: checked as boolean })
              }
            />
            <span className={`flex-1 ${todo.completed ? 'line-through text-gray-500' : ''}`}>
              {todo.text}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => deleteTodoMutation.mutate(todo.id)}
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      {todos.length === 0 && (
        <p className="text-center text-gray-500 mt-6">
          Nessun task da mostrare. Aggiungine uno!
        </p>
      )}
    </div>
  );
};

export default TodoList;
