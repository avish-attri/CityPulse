import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, MessageCircle, Trash2 } from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { timeAgo } from '../utils/helpers';
import { Avatar, LoadingSpinner, Modal } from '../components/UI';

function QuestionCard({ question, onAnswer, onDelete, onDeleteAnswer }) {
  const { user } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [answerText, setAnswerText] = useState('');

  const handleAnswer = () => {
    if (!answerText.trim()) return;
    onAnswer(question._id, answerText);
    setAnswerText('');
  };

  const userId = user?._id ? String(user._id) : null;
  const canDelete = user?.role === 'admin' || String(question.author?._id) === userId;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl bg-slate-950/90 border border-gray-800 p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Avatar user={question.author} size="sm" />
          <div>
            <p className="font-medium text-sm">{question.author?.name}</p>
            <p className="text-xs text-gray-400">{timeAgo(question.createdAt)}</p>
          </div>
        </div>
        {canDelete && (
          <button
            type="button"
            onClick={() => onDelete(question._id)}
            className="btn-ghost ml-auto rounded-full p-2 text-red-400 hover:text-red-200"
            aria-label="Delete question"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      <h3 className="font-semibold text-xl mt-3 cursor-pointer hover:text-primary-600" onClick={() => setExpanded((prev) => !prev)}>
        {question.title}
      </h3>
      <div className="mt-3 text-sm text-gray-400">
        {question.answers?.length || 0} answer{question.answers?.length === 1 ? '' : 's'}
      </div>

      {expanded && (
        <div className="mt-4 space-y-3">
          {question.answers?.map((answer) => {
            const canDeleteAnswer = user?.role === 'admin' || String(answer.author?._id) === userId;
            return (
              <div key={answer._id} className="rounded-3xl p-4 bg-slate-900 text-gray-100">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <Avatar user={answer.author} size="sm" />
                    <div>
                      <p className="text-sm font-semibold">{answer.author?.name}</p>
                      <p className="text-xs text-gray-500">{timeAgo(answer.createdAt)}</p>
                    </div>
                  </div>
                  {canDeleteAnswer && (
                    <button
                      type="button"
                      onClick={() => onDeleteAnswer(question._id, answer._id)}
                      className="btn-ghost rounded-full p-2 text-red-400 hover:text-red-200"
                      aria-label="Delete answer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">{answer.content}</p>
              </div>
            );
          })}

          {user && (
            <div className="mt-4 rounded-3xl border border-gray-800 bg-slate-900 p-4">
              <textarea
                className="input-field w-full min-h-[90px] resize-none"
                placeholder="Type your answer..."
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
              />
              <button onClick={handleAnswer} className="mt-3 btn-primary w-full">
                Reply
              </button>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

function CreateQuestionModal({ open, onClose }) {
  const qc = useQueryClient();
  const { user } = useAuth();
  const [form, setForm] = useState({ title: '' });

  const mutation = useMutation({
    mutationFn: () => api.post('/questions', {
      title: form.title,
      content: form.title,
      city: user?.city || 'Chandigarh',
      lat: 30.7333,
      lng: 76.7794,
    }),
    onSuccess: () => { qc.invalidateQueries(['questions']); onClose(); },
  });

  return (
    <Modal open={open} onClose={onClose} title="Ask Locals">
      <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }} className="space-y-4">
        <input className="input-field" placeholder="Ask your question" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <button type="submit" disabled={mutation.isPending} className="btn-primary w-full">
          {mutation.isPending ? 'Posting...' : 'Ask Question'}
        </button>
      </form>
    </Modal>
  );
}

export default function AskPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);

  const userCity = user?.city || 'Chandigarh';

  const { data, isLoading, error } = useQuery({
    queryKey: ['questions', userCity],
    queryFn: () => api.get('/questions', { params: { city: userCity } }).then((r) => r.data),
  });

  const answerMutation = useMutation({
    mutationFn: ({ id, content }) => api.post(`/questions/${id}/answers`, { content }),
    onSuccess: () => qc.invalidateQueries(['questions']),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/questions/${id}`).then((r) => r.data),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ['questions', userCity] });
      const previous = qc.getQueryData(['questions', userCity]);
      qc.setQueryData(['questions', userCity], (old) => {
        if (!old) return old;
        return { ...old, questions: old.questions.filter((q) => q._id !== id) };
      });
      return { previous };
    },
    onError: (err, _vars, context) => {
      console.error('Failed to delete question', err);
      if (context?.previous) qc.setQueryData(['questions', userCity], context.previous);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['questions', userCity] }),
  });

  const deleteAnswerMutation = useMutation({
    mutationFn: ({ questionId, answerId }) => api.delete(`/questions/${questionId}/answers/${answerId}`).then((r) => r.data),
    onMutate: async ({ questionId, answerId }) => {
      await qc.cancelQueries({ queryKey: ['questions', userCity] });
      const previous = qc.getQueryData(['questions', userCity]);
      qc.setQueryData(['questions', userCity], (old) => {
        if (!old) return old;
        return {
          ...old,
          questions: old.questions.map((q) => {
            if (q._id !== questionId) return q;
            return { ...q, answers: q.answers.filter((a) => a._id !== answerId) };
          }),
        };
      });
      return { previous };
    },
    onError: (err, _vars, context) => {
      console.error('Failed to delete answer', err);
      if (context?.previous) qc.setQueryData(['questions', userCity], context.previous);
    },
    onSuccess: (data) => {
      const returnedQuestion = data?.question;
      if (!returnedQuestion) return;
      qc.setQueryData(['questions', userCity], (old) => {
        if (!old) return old;
        return {
          ...old,
          questions: old.questions.map((q) => (q._id === returnedQuestion._id ? returnedQuestion : q)),
        };
      });
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['questions', userCity] }),
  });

  return (
    <div className="flex items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-3xl rounded-[2rem] border border-gray-800 bg-slate-900 shadow-2xl">
        <div className="flex flex-col items-center sm:flex-row sm:items-center justify-center gap-4 sm:gap-20 border-b border-gray-800 px-6 py-5">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2 justify-center text-white">
              <MessageCircle className="w-6 h-6 text-primary-600" /> Ask Locals
            </h1>
            <p className="text-sm text-gray-400 mt-1 text-center">Get answers from people who know the city</p>
          </div>
          {user && (
            <button onClick={() => setShowCreate(true)} className="btn-primary rounded-full px-4 py-2 text-sm">
              <Plus className="w-4 h-4" /> Ask Question
            </button>
          )}
        </div>

        {!user ? (
          <div className="p-10 text-center text-gray-400">You need to be logged in to ask locals</div>
        ) : error ? (
          <div className="p-10 text-center text-red-400">Unable to load questions. Please try again.</div>
        ) : isLoading ? (
          <div className="p-10">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="space-y-4 p-6">
            <div className="rounded-[2rem] bg-slate-950 p-4 shadow-inner">
              {data?.questions?.length ? (
                data.questions.map((q) => (
                  <QuestionCard
                    key={q._id}
                    question={q}
                    onAnswer={(id, content) => answerMutation.mutate({ id, content })}
                    onDelete={(id) => deleteMutation.mutate(id)}
                    onDeleteAnswer={(questionId, answerId) => deleteAnswerMutation.mutate({ questionId, answerId })}
                  />
                ))
              ) : (
                <div className="text-center text-gray-400 py-16">No local questions found yet. Ask the first local question!</div>
              )}
            </div>
          </div>
        )}

        {user && <CreateQuestionModal open={showCreate} onClose={() => setShowCreate(false)} />}
      </div>
    </div>
  );
}
