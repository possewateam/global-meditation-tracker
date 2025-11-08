import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';

interface Quote {
  id: string;
  text: string;
  author: string;
}

export const InspirationalQuotes = () => {
  const { i18n } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuotes();
  }, [i18n.language]);

  const fetchQuotes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('quotes')
      .select('id, text, author')
      .eq('is_active', true)
      .eq('language', i18n.language || 'en');

    if (!error && data && data.length > 0) {
      setQuotes(data);
    } else {
      const { data: fallbackData } = await supabase
        .from('quotes')
        .select('id, text, author')
        .eq('is_active', true)
        .eq('language', 'en');

      if (fallbackData) {
        setQuotes(fallbackData);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    if (quotes.length === 0) return;

    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % quotes.length);
        setFade(true);
      }, 500);
    }, 10000);

    return () => clearInterval(interval);
  }, [quotes.length]);

  if (loading || quotes.length === 0) {
    return null;
  }

  const currentQuote = quotes[currentIndex];

  return (
    <div className="text-center py-6">
      <p
        className={`text-lg md:text-xl text-teal-200 italic transition-opacity duration-500 ${
          fade ? 'opacity-100' : 'opacity-0'
        }`}
      >
        "{currentQuote.text}"
      </p>
      <p className="text-sm text-teal-400 mt-2">
        - {currentQuote.author}
      </p>
    </div>
  );
};
