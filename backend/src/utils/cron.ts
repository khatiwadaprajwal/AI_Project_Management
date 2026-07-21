import cron from "node-cron";
import prisma from "../config/db";
export async function deleteExpiredTempUsers() {
  const result = await prisma.tempUser.deleteMany({
    where: {
      otpExpiresAt: {
        lt: new Date(),
      },
    },
  });

  if (result.count > 0) {
    console.log(`Deleted ${result.count} expired temporary users.`);
  }
}
cron.schedule("0 * * * *", async () => {
  try {
    await deleteExpiredTempUsers();
  } catch (error) {
    console.error("Temp user cleanup failed:", error);
  }
});