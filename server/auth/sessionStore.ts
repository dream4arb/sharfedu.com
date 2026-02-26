import type { Request } from "express";
import type { SessionData } from "express-session";
import session from "express-session";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { sessions } from "@shared/schema";

function getExpire(sess: SessionData): Date {
  const exp = sess.cookie?.expires;
  if (exp instanceof Date) return exp;
  if (typeof exp === "number") return new Date(exp);
  return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
}

/**
 * SQLite session store extending express-session Store.
 * Implements get, set, destroy, touch. Regenerate and createSession come from the base Store.
 */
class SQLiteStore extends session.Store {
  get(sid: string, cb: (err: unknown, session?: SessionData | null) => void): void {
    db.select()
      .from(sessions)
      .where(eq(sessions.sid, sid))
      .limit(1)
      .then((rows) => {
        if (rows.length === 0) return cb(null, null);
        const row = rows[0];
        if (row.expire && new Date(row.expire).getTime() < Date.now()) {
          db.delete(sessions)
            .where(eq(sessions.sid, sid))
            .then(() => cb(null, null))
            .catch(cb);
          return;
        }
        try {
          const sess = JSON.parse(row.sess) as SessionData;
          cb(null, sess);
        } catch {
          cb(null, null);
        }
      })
      .catch(cb);
  }

  set(sid: string, sess: SessionData, cb?: (err?: unknown) => void): void {
    const expire = getExpire(sess);
    const sessStr = JSON.stringify(sess);
    const done = cb ?? (() => {});
    db.delete(sessions)
      .where(eq(sessions.sid, sid))
      .then(() =>
        db.insert(sessions).values({ sid, sess: sessStr, expire }).then(() => done()).catch(done)
      )
      .catch(done);
  }

  destroy(sid: string, cb?: (err?: unknown) => void): void {
    const done = cb ?? (() => {});
    db.delete(sessions)
      .where(eq(sessions.sid, sid))
      .then(() => done())
      .catch(done);
  }

  touch(sid: string, sess: SessionData, cb?: (err?: unknown) => void): void {
    const expire = getExpire(sess);
    const done = cb ?? (() => {});
    db.update(sessions)
      .set({ expire })
      .where(eq(sessions.sid, sid))
      .then(() => done())
      .catch(done);
  }

  /** حذف الجلسة القديمة ثم استدعاء generate الذي يضيفه express-session على الـ store. */
  regenerate(req: Request, cb: (err?: unknown) => void): void {
    const oldSid = req.sessionID;
    if (!oldSid) {
      cb();
      return;
    }
    this.destroy(oldSid, (err) => {
      if (err) return cb(err);
      const s = this as session.Store & { generate?: (r: Request) => void };
      if (typeof s.generate === "function") s.generate(req);
      cb();
    });
  }
}

export function createSessionStore(): session.Store {
  return new SQLiteStore();
}
