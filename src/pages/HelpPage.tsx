import { useEffect, useState } from 'react';
import { ArrowLeft, Youtube, Image as ImageIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { LanguageSelector } from '../components/LanguageSelector';

interface HelpPageProps {
  onBack: () => void;
}

export const HelpPage = ({ onBack }: HelpPageProps) => {
  const { t } = useTranslation();
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHelpSettings();
  }, []);

  const fetchHelpSettings = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('help_settings')
      .select('*')
      .eq('is_active', true)
      .maybeSingle();

    if (data) {
      setYoutubeUrl(data.youtube_url || '');
      setImageUrl(data.image_url || '');
    }
    setLoading(false);
  };

  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    if (url.includes('embed')) return url;
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(youtubeRegex);
    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }
    return '';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-teal-800 to-emerald-900 p-4 md:p-8">
      <div className="absolute top-4 right-4">
        <LanguageSelector />
      </div>

      <div className="max-w-5xl mx-auto">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 md:p-8 shadow-2xl border border-teal-500/20">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white">Project Help</h1>
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-semibold transition-all duration-300 hover:shadow-lg"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Back to Dashboard</span>
            </button>
          </div>

          {loading ? (
            <div className="text-center text-teal-300 py-20">
              <div className="animate-pulse">Loading help content...</div>
            </div>
          ) : (
            <div className="space-y-8">
              {youtubeUrl && getEmbedUrl(youtubeUrl) ? (
                <div className="bg-white/5 rounded-xl p-6 border border-teal-500/20">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-red-500 rounded-lg p-3">
                      <Youtube className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Help Video</h2>
                  </div>
                  <div className="aspect-video bg-black rounded-lg overflow-hidden shadow-xl">
                    <iframe
                      src={getEmbedUrl(youtubeUrl)}
                      title="Help Video"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    />
                  </div>
                </div>
              ) : null}

              {imageUrl ? (
                <div className="bg-white/5 rounded-xl p-6 border border-teal-500/20">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-blue-500 rounded-lg p-3">
                      <ImageIcon className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Help Guide</h2>
                  </div>
                  <div className="bg-white/5 rounded-lg overflow-hidden shadow-xl">
                    <img
                      src={imageUrl}
                      alt="Help Guide"
                      className="w-full rounded-lg"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                </div>
              ) : null}

              {!youtubeUrl && !imageUrl && (
                <div className="text-center text-teal-300 py-20">
                  <div className="bg-white/5 rounded-xl p-12 border border-teal-500/20">
                    <p className="text-2xl font-semibold mb-3">No help content available yet</p>
                    <p className="text-base">Contact the administrator to add help resources.</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
