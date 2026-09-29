import { supabase } from "./supabase";
import type { INotificationService } from "./interfaces";
import type { NotificationDTO } from "./types";
import { fail, num, rows, text } from "./adapters";

export class NotificationService implements INotificationService {
  async list(): Promise<NotificationDTO[]> {
    const { data, error } = await supabase
      .from("notifications")
      .select("notification_id, branch_id, title, message, notification_type, created_at, is_read")
      .order("created_at", { ascending: false });
    if (error) fail("Unable to load notifications", error);
    return rows(data).map((r) => ({
      id: num(r.notification_id),
      branchId: num(r.branch_id),
      title: text(r.title),
      message: text(r.message),
      type: text(r.notification_type),
      createdAt: text(r.created_at),
      isRead: r.is_read === true,
    }));
  }

  async markRead(ids: number[], isRead = true): Promise<void> {
    if (!ids.length) return;
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: isRead })
      .in("notification_id", ids);
    if (error) fail("Unable to update notifications", error);
  }

  async remove(ids: number[]): Promise<void> {
    if (!ids.length) return;
    const { error } = await supabase.from("notifications").delete().in("notification_id", ids);
    if (error) fail("Unable to delete notifications", error);
  }
}
