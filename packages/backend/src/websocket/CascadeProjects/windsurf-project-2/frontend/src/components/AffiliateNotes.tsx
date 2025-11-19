import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { AffiliateNote, NoteType } from '@/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Phone, Mail, Users, FileText } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

interface AffiliateNotesProps {
  affiliateId: string;
}

const AffiliateNotes: React.FC<AffiliateNotesProps> = ({ affiliateId }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingNote, setEditingNote] = useState<AffiliateNote | null>(null);
  const [noteContent, setNoteContent] = useState('');
  const [noteType, setNoteType] = useState<NoteType>('GENERAL');
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: notes, isLoading } = useQuery<AffiliateNote[]>({
    queryKey: ['affiliate-notes', affiliateId],
    queryFn: async () => {
      const response = await api.get(`/affiliate-notes/${affiliateId}`);
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: { content: string; noteType: NoteType }) =>
      api.post(`/affiliate-notes/${affiliateId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['affiliate-notes', affiliateId] });
      setNoteContent('');
      setNoteType('GENERAL');
      setIsAdding(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { content: string; noteType: NoteType } }) =>
      api.put(`/affiliate-notes/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['affiliate-notes', affiliateId] });
      setEditingNote(null);
      setNoteContent('');
      setNoteType('GENERAL');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/affiliate-notes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['affiliate-notes', affiliateId] });
    },
  });

  const handleSubmit = () => {
    if (!noteContent.trim()) return;

    if (editingNote) {
      updateMutation.mutate({
        id: editingNote.id,
        data: { content: noteContent, noteType },
      });
    } else {
      createMutation.mutate({ content: noteContent, noteType });
    }
  };

  const handleEdit = (note: AffiliateNote) => {
    setEditingNote(note);
    setNoteContent(note.content);
    setNoteType(note.noteType);
    setIsAdding(true);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingNote(null);
    setNoteContent('');
    setNoteType('GENERAL');
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this note?')) {
      deleteMutation.mutate(id);
    }
  };

  const getNoteTypeIcon = (type: NoteType) => {
    switch (type) {
      case 'CALL':
        return <Phone className="h-4 w-4" />;
      case 'MEETING':
        return <Users className="h-4 w-4" />;
      case 'EMAIL':
        return <Mail className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getNoteTypeBadgeColor = (type: NoteType) => {
    switch (type) {
      case 'CALL':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'MEETING':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'EMAIL':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Activity Notes</CardTitle>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Note
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {isAdding && (
          <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
            <div className="space-y-2">
              <Label htmlFor="noteType">Note Type</Label>
              <Select value={noteType} onValueChange={(value) => setNoteType(value as NoteType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CALL">📞 Call</SelectItem>
                  <SelectItem value="MEETING">👥 Meeting</SelectItem>
                  <SelectItem value="EMAIL">📧 Email</SelectItem>
                  <SelectItem value="GENERAL">📝 General</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="noteContent">Note</Label>
              <Textarea
                id="noteContent"
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Enter your note here..."
                rows={4}
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleSubmit}
                disabled={!noteContent.trim() || createMutation.isPending || updateMutation.isPending}
              >
                {editingNote ? 'Update' : 'Save'} Note
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading notes...</div>
          ) : notes && notes.length > 0 ? (
            notes.map((note) => (
              <div key={note.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge className={`${getNoteTypeBadgeColor(note.noteType)} border flex items-center gap-1`}>
                        {getNoteTypeIcon(note.noteType)}
                        {note.noteType}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(note.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                    <div className="text-xs text-muted-foreground">
                      By {note.user?.firstName} {note.user?.lastName}
                      {note.createdAt !== note.updatedAt && ' (edited)'}
                    </div>
                  </div>
                  {(user?.role === 'ADMIN' || note.userId === user?.id) && (
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(note)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(note.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No notes yet. Click "Add Note" to create one.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AffiliateNotes;
