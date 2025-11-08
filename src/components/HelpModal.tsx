import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal = ({ isOpen, onClose }: HelpModalProps) => {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchHelpSettings();
    }
  }, [isOpen]);

  const fetchHelpSettings = async () => {
    setLoading(true);
    const { data: rows } = await supabase
      .from('help_settings')
      .select('*')
      .eq('is_active', true)
      .order('updated_at', { ascending: false })
      .limit(1);

    const data = Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
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

  if (!isOpen) return null;

  const handleOpenVideo = () => {
    const embedUrl = getEmbedUrl(youtubeUrl);
    if (embedUrl) {
      const fullUrl = embedUrl.replace('/embed/', '/watch?v=');
      window.open(fullUrl, '_blank', 'width=1000,height=700,resizable=yes,scrollbars=yes');
    }
  };

  const handleOpenImage = () => {
    if (imageUrl) {
      window.open(imageUrl, '_blank', 'width=1000,height=700,resizable=yes,scrollbars=yes');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-teal-900 to-blue-900 rounded-2xl max-w-md w-full shadow-2xl border border-teal-500/30">
        <div className="bg-gradient-to-br from-teal-900 to-blue-900 p-4 border-b border-teal-500/30 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Project Help</h2>
          <button
            onClick={onClose}
            className="text-teal-300 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4 space-y-3">
          {loading ? (
            <div className="text-center text-teal-300 py-12">
              Loading help content...
            </div>
          ) : (
            <>
              {youtubeUrl && getEmbedUrl(youtubeUrl) ? (
                <button
                  onClick={handleOpenVideo}
                  className="w-full bg-white/10 hover:bg-white/20 border border-teal-500/30 rounded-lg p-4 transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/20"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-red-500 rounded-lg p-3">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                      </svg>
                    </div>
                    <div className="text-left flex-1">
                      <h3 className="text-lg font-semibold text-white">Help Video</h3>
                      <p className="text-teal-300 text-xs">Click to open in popup</p>
                    </div>
                  </div>
                </button>
              ) : null}

              {imageUrl ? (
                <button
                  onClick={handleOpenImage}
                  className="w-full bg-white/10 hover:bg-white/20 border border-teal-500/30 rounded-lg p-4 transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/20"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-500 rounded-lg p-3">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="text-left flex-1">
                      <h3 className="text-lg font-semibold text-white">Help Guide</h3>
                      <p className="text-teal-300 text-xs">Click to open in popup</p>
                    </div>
                  </div>
                </button>
              ) : null}

              {!youtubeUrl && !imageUrl && (
                <div className="text-center text-teal-300 py-8">
                  <p className="text-base">No help content available yet.</p>
                  <p className="text-xs mt-2">Contact the administrator to add help resources.</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
