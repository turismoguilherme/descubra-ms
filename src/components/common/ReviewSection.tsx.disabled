import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star, UserCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { tourismReviewService } from '@/services/reviews/tourismReviewService';
import { TourismReview } from '@/types/passport';
import { useAuth } from "@/hooks/useAuth";

interface ReviewSectionProps {
  targetId: string; // ID do roteiro ou checkpoint
  targetType: 'route' | 'checkpoint';
}

const ReviewSection = ({ targetId, targetType }: ReviewSectionProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reviews, setReviews] = useState<TourismReview[]>([]);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [targetId, targetType]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      let fetchedReviews: TourismReview[] = [];
      if (targetType === 'route') {
        fetchedReviews = await tourismReviewService.getReviewsByRouteId(targetId);
      } else if (targetType === 'checkpoint') {
        fetchedReviews = await tourismReviewService.getReviewsByCheckpointId(targetId);
      }
      setReviews(fetchedReviews);
    } catch (error) {
      console.error("Erro ao carregar avaliações:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as avaliações.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!user) {
      toast({
        title: "Ação não permitida",
        description: "Você precisa estar logado para enviar uma avaliação.",
        variant: "destructive",
      });
      return;
    }

    if (newRating === 0 || !newComment.trim()) {
      toast({
        title: "Preenchimento Obrigatório",
        description: "Por favor, forneça uma nota e um comentário.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const reviewData = {
        user_id: user.id,
        rating: newRating,
        comment: newComment.trim(),
        ...(targetType === 'route' && { route_id: targetId }),
        ...(targetType === 'checkpoint' && { checkpoint_id: targetId }),
      };

      await tourismReviewService.createReview(reviewData);
      setNewRating(0);
      setNewComment('');
      toast({
        title: "Avaliação enviada!",
        description: "Sua avaliação foi registrada com sucesso.",
      });
      fetchReviews(); // Recarregar avaliações após o envio
    } catch (error) {
      console.error("Erro ao enviar avaliação:", error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar sua avaliação. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Deixe sua avaliação</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-1 mb-4">
            <Label htmlFor="rating" className="sr-only">Sua Nota</Label>
            {Array.from({ length: 5 }, (_, i) => (
              <Star
                key={i}
                className={`w-6 h-6 cursor-pointer ${i < newRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                onClick={() => setNewRating(i + 1)}
              />
            ))}
          </div>
          <Label htmlFor="comment" className="mb-2">Seu Comentário</Label>
          <Textarea
            id="comment"
            placeholder="Compartilhe sua experiência..." 
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={4}
            className="mb-4"
          />
          <Button onClick={handleSubmitReview} disabled={submitting || !user}>
            {submitting ? "Enviando..." : "Enviar Avaliação"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Avaliações ({reviews.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-gray-500">Carregando avaliações...</p>
          ) : reviews.length === 0 ? (
            <p className="text-center text-gray-500">Nenhuma avaliação ainda. Seja o primeiro a avaliar!</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="border-b pb-4 last:border-b-0">
                  <div className="flex items-center gap-2 mb-2">
                    <UserCircle className="w-6 h-6 text-gray-500" />
                    <span className="font-semibold">Usuário {review.user_id.substring(0, 8)}...</span>
                    <span className="text-sm text-gray-500">({new Date(review.created_at).toLocaleDateString()})</span>
                  </div>
                  <div className="flex items-center gap-1 mb-2">
                    {renderStars(review.rating)}
                  </div>
                  <p className="text-gray-700">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReviewSection; 