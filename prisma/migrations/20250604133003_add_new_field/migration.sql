-- CreateEnum
CREATE TYPE "sms_status_enum" AS ENUM ('accepted', 'scheduled', 'queued', 'sending', 'sent', 'receiving', 'received', 'delivered', 'undelivered', 'failed', 'read', 'canceled', 'partially_delivered');
