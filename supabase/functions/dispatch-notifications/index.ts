import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

function calculateNextOccurrence(currentTime: string, rrule: string): string {
  const current = new Date(currentTime);
  let nextTime: Date;

  if (rrule === 'FREQ=DAILY') {
    nextTime = new Date(current.getTime() + 24 * 60 * 60 * 1000);
  } else if (rrule === 'FREQ=WEEKLY') {
    nextTime = new Date(current.getTime() + 7 * 24 * 60 * 60 * 1000);
  } else if (rrule === 'FREQ=MONTHLY') {
    nextTime = new Date(current);
    nextTime.setMonth(nextTime.getMonth() + 1);
  } else {
    nextTime = new Date(current.getTime() + 24 * 60 * 60 * 1000);
  }

  return nextTime.toISOString();
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const now = new Date().toISOString();

    const { data: notifications, error: fetchError } = await supabase
      .from('notifications')
      .select('*')
      .eq('status', 'scheduled')
      .lte('send_at', now);

    if (fetchError) {
      throw fetchError;
    }

    const results = [];

    for (const notification of notifications || []) {
      try {
        const { data: recipients } = await supabase
          .rpc('get_notification_recipients', {
            p_audience_type: notification.audience_type,
            p_audience_filter: notification.audience_filter,
          });

        const deliveries = [];

        for (const recipient of recipients || []) {
          for (const channel of notification.channels) {
            if (channel === 'in_app') {
              deliveries.push({
                notification_id: notification.id,
                user_id: recipient.user_id,
                channel: 'in_app',
                status: 'sent',
                delivered_at: new Date().toISOString(),
              });
            }

            if (channel === 'web_push') {
              const { data: subscriptions } = await supabase
                .from('push_subscriptions')
                .select('*')
                .eq('user_id', recipient.user_id);

              for (const sub of subscriptions || []) {
                try {
                  deliveries.push({
                    notification_id: notification.id,
                    user_id: recipient.user_id,
                    channel: 'web_push',
                    status: 'sent',
                    delivered_at: new Date().toISOString(),
                  });
                } catch (pushError) {
                  deliveries.push({
                    notification_id: notification.id,
                    user_id: recipient.user_id,
                    channel: 'web_push',
                    status: 'failed',
                    error_message: pushError.message,
                    delivered_at: new Date().toISOString(),
                  });
                }
              }
            }
          }
        }

        if (deliveries.length > 0) {
          await supabase.from('notification_deliveries').insert(deliveries);
        }

        if (notification.repeat_rrule && notification.repeat_rrule !== '') {
          const nextSendTime = calculateNextOccurrence(notification.send_at, notification.repeat_rrule);

          await supabase
            .from('notifications')
            .update({
              send_at: nextSendTime,
              sent_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('id', notification.id);

          await supabase.from('notification_dispatch_logs').insert({
            notification_id: notification.id,
            dispatch_time: new Date().toISOString(),
            success: true,
            recipients_count: deliveries.length,
          });
        } else {
          await supabase
            .from('notifications')
            .update({
              status: 'sent',
              sent_at: new Date().toISOString(),
            })
            .eq('id', notification.id);

          await supabase.from('notification_dispatch_logs').insert({
            notification_id: notification.id,
            dispatch_time: new Date().toISOString(),
            success: true,
            recipients_count: deliveries.length,
          });
        }

        const channel = supabase.channel('notifications');
        channel.send({
          type: 'broadcast',
          event: 'new_notification',
          payload: {
            id: notification.id,
            title: notification.title,
            body: notification.body,
          },
        });

        results.push({
          notification_id: notification.id,
          status: 'success',
          deliveries: deliveries.length,
          recurring: !!notification.repeat_rrule,
        });
      } catch (error) {
        await supabase.from('notification_dispatch_logs').insert({
          notification_id: notification.id,
          dispatch_time: new Date().toISOString(),
          success: false,
          recipients_count: 0,
          error_message: error.message,
        });

        results.push({
          notification_id: notification.id,
          status: 'error',
          error: error.message,
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: notifications?.length || 0,
        results,
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});