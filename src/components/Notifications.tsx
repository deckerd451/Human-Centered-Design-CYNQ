import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Bell, MessageSquare, ArrowUp, UserPlus, Inbox, UserCheck, UserX } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAuthStore } from '@/stores/authStore';
import { getNotifications, markNotificationsAsRead } from '@/lib/apiClient';
import { Notification } from '@shared/types';
import { cn } from '@/lib/utils';
const NOTIFICATION_ICONS: Record<Notification['type'], React.ReactNode> = {
  new_comment: <MessageSquare className="h-4 w-4 text-blue-500" />,
  idea_upvote: <ArrowUp className="h-4 w-4 text-green-500" />,
  join_request: <UserPlus className="h-4 w-4 text-purple-500" />,
  join_request_accepted: <UserCheck className="h-4 w-4 text-green-500" />,
  join_request_declined: <UserX className="h-4 w-4 text-red-500" />,
};
export function Notifications() {
  const user = useAuthStore((s) => s.user);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => {
    if (user) {
      const fetchNotifications = () => {
        getNotifications(user.id)
          .then(setNotifications)
          .catch(console.error);
      };
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000); // Poll every 30 seconds
      return () => clearInterval(interval);
    }
  }, [user]);
  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);
  const handleOpenChange = async (open: boolean) => {
    setIsOpen(open);
    if (open && unreadCount > 0) {
      const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
      try {
        if (user) {
          await markNotificationsAsRead(user.id, unreadIds);
          setNotifications(prev =>
            prev.map(n => (unreadIds.includes(n.id) ? { ...n, read: true } : n))
          );
        }
      } catch (error) {
        console.error("Failed to mark notifications as read", error);
      }
    }
  };
  if (!user) return null;
  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4">
          <h3 className="text-lg font-semibold">Notifications</h3>
        </div>
        <Separator />
        {notifications.length > 0 ? (
          <div className="max-h-96 overflow-y-auto">
            {notifications.map(notification => (
              <Link
                to={notification.link}
                key={notification.id}
                className="block"
                onClick={() => setIsOpen(false)}
              >
                <div className={cn(
                  "flex items-start gap-3 p-4 hover:bg-accent",
                  !notification.read && "bg-blue-500/10"
                )}>
                  <div className="mt-1">
                    {NOTIFICATION_ICONS[notification.type]}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">{notification.message}</p>
                    <p className="text-xs text-muted-foreground">{notification.createdAt}</p>
                  </div>
                  {!notification.read && (
                    <div className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-muted-foreground">
            <Inbox className="mx-auto h-12 w-12" />
            <p className="mt-4 text-sm">You're all caught up!</p>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}