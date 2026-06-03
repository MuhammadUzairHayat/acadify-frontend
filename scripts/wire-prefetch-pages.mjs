import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appDir = path.join(__dirname, "..", "app");

const pages = [
  {
    file: "page.tsx",
    body: `import { HomePageClient } from "@/components/pages/home/HomePageClient";
import { renderPrefetched } from "@/lib/server/render";
import { prefetchHomePage } from "@/lib/server/prefetch";

export default async function Page() {
  return renderPrefetched(prefetchHomePage, <HomePageClient />);
}
`,
  },
  {
    file: "courses/page.tsx",
    body: `import { CoursesPageClient } from "@/components/pages/courses/CoursesPageClient";
import { renderPrefetched } from "@/lib/server/render";
import { prefetchCoursesPage } from "@/lib/server/prefetch";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function Page({ searchParams }: PageProps) {
  const sp = await searchParams;
  return renderPrefetched(
    (qc) => prefetchCoursesPage(qc, sp),
    <CoursesPageClient />,
  );
}
`,
  },
  {
    file: "courses/[slug]/page.tsx",
    body: `import { CoursesslugPageClient } from "@/components/pages/courses/[slug]/CoursesslugPageClient";
import { renderPrefetched } from "@/lib/server/render";
import { prefetchCourseBySlug } from "@/lib/server/prefetch";

type PageProps = { params: Promise<{ slug: string }> };

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  return renderPrefetched(
    (qc) => prefetchCourseBySlug(qc, slug),
    <CoursesslugPageClient />,
  );
}
`,
  },
  {
    file: "academies/page.tsx",
    body: `import { AcademiesPageClient } from "@/components/pages/academies/AcademiesPageClient";
import { renderPrefetched } from "@/lib/server/render";
import { prefetchAcademiesPage } from "@/lib/server/prefetch";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function Page({ searchParams }: PageProps) {
  const sp = await searchParams;
  return renderPrefetched(
    (qc) => prefetchAcademiesPage(qc, sp),
    <AcademiesPageClient />,
  );
}
`,
  },
  {
    file: "academies/[slug]/page.tsx",
    body: `import { AcademiesslugPageClient } from "@/components/pages/academies/[slug]/AcademiesslugPageClient";
import { renderPrefetched } from "@/lib/server/render";
import { prefetchAcademyBySlug } from "@/lib/server/prefetch";

type PageProps = { params: Promise<{ slug: string }> };

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  return renderPrefetched(
    (qc) => prefetchAcademyBySlug(qc, slug),
    <AcademiesslugPageClient />,
  );
}
`,
  },
  {
    file: "(protected)/student/dashboard/page.tsx",
    body: `import { StudentDashboardPageClient } from "@/components/pages/student/dashboard/StudentDashboardPageClient";
import { renderPrefetched } from "@/lib/server/render";
import { requireSession } from "@/lib/server/session";
import { prefetchAuthProfile, prefetchStudentDashboard } from "@/lib/server/prefetch";

export default async function Page() {
  await requireSession("STUDENT");
  return renderPrefetched(async (qc) => {
    await Promise.all([prefetchAuthProfile(qc), prefetchStudentDashboard(qc)]);
  }, <StudentDashboardPageClient />);
}
`,
  },
  {
    file: "(protected)/student/courses/page.tsx",
    body: `import { StudentCoursesPageClient } from "@/components/pages/student/courses/StudentCoursesPageClient";
import { renderPrefetched } from "@/lib/server/render";
import { requireSession } from "@/lib/server/session";
import { prefetchStudentCourses } from "@/lib/server/prefetch";

export default async function Page() {
  await requireSession("STUDENT");
  return renderPrefetched(
    (qc) => prefetchStudentCourses(qc, { limit: 24 }),
    <StudentCoursesPageClient />,
  );
}
`,
  },
  {
    file: "(protected)/student/profile/page.tsx",
    body: `import { StudentProfilePageClient } from "@/components/pages/student/profile/StudentProfilePageClient";
import { renderPrefetched } from "@/lib/server/render";
import { requireSession } from "@/lib/server/session";
import { prefetchStudentProfile } from "@/lib/server/prefetch";

export default async function Page() {
  await requireSession("STUDENT");
  return renderPrefetched(prefetchStudentProfile, <StudentProfilePageClient />);
}
`,
  },
  {
    file: "(protected)/student/notifications/page.tsx",
    body: `import { StudentNotificationsPageClient } from "@/components/pages/student/notifications/StudentNotificationsPageClient";
import { renderPrefetched } from "@/lib/server/render";
import { requireSession } from "@/lib/server/session";
import { prefetchStudentNotifications } from "@/lib/server/prefetch";

export default async function Page() {
  await requireSession("STUDENT");
  return renderPrefetched(
    (qc) => prefetchStudentNotifications(qc, { limit: 50 }),
    <StudentNotificationsPageClient />,
  );
}
`,
  },
  {
    file: "(protected)/student/certificates/page.tsx",
    body: `import { StudentCertificatesPageClient } from "@/components/pages/student/certificates/StudentCertificatesPageClient";
import { renderPrefetched } from "@/lib/server/render";
import { requireSession } from "@/lib/server/session";
import { prefetchStudentCertificates } from "@/lib/server/prefetch";

export default async function Page() {
  await requireSession("STUDENT");
  return renderPrefetched(prefetchStudentCertificates, <StudentCertificatesPageClient />);
}
`,
  },
  {
    file: "(protected)/student/certificates/[certificateId]/page.tsx",
    body: `import { StudentCertificatescertificateIdPageClient } from "@/components/pages/student/certificates/[certificateId]/StudentCertificatescertificateIdPageClient";
import { renderPrefetched } from "@/lib/server/render";
import { requireSession } from "@/lib/server/session";
import { prefetchStudentCertificate } from "@/lib/server/prefetch";

type PageProps = { params: Promise<{ certificateId: string }> };

export default async function Page({ params }: PageProps) {
  await requireSession("STUDENT");
  const { certificateId } = await params;
  return renderPrefetched(
    (qc) => prefetchStudentCertificate(qc, certificateId),
    <StudentCertificatescertificateIdPageClient />,
  );
}
`,
  },
  {
    file: "(protected)/student/courses/[courseId]/play/page.tsx",
    body: `import { StudentCoursescourseIdPlayPageClient } from "@/components/pages/student/courses/[courseId]/play/StudentCoursescourseIdPlayPageClient";
import { renderPrefetched } from "@/lib/server/render";
import { requireSession } from "@/lib/server/session";
import { prefetchCoursePlayer } from "@/lib/server/prefetch";

type PageProps = { params: Promise<{ courseId: string }> };

export default async function Page({ params }: PageProps) {
  await requireSession("STUDENT");
  const { courseId } = await params;
  return renderPrefetched(
    (qc) => prefetchCoursePlayer(qc, courseId),
    <StudentCoursescourseIdPlayPageClient />,
  );
}
`,
  },
  {
    file: "(protected)/owner/dashboard/page.tsx",
    body: `import { OwnerDashboardPageClient } from "@/components/pages/owner/dashboard/OwnerDashboardPageClient";
import { renderPrefetched } from "@/lib/server/render";
import { requireSession } from "@/lib/server/session";
import { prefetchOwnerDashboard } from "@/lib/server/prefetch";

export default async function Page() {
  await requireSession("OWNER");
  return renderPrefetched(prefetchOwnerDashboard, <OwnerDashboardPageClient />);
}
`,
  },
  {
    file: "(protected)/owner/academy/page.tsx",
    body: `import { OwnerAcademyPageClient } from "@/components/pages/owner/academy/OwnerAcademyPageClient";
import { renderPrefetched } from "@/lib/server/render";
import { requireSession } from "@/lib/server/session";
import { prefetchMyAcademy } from "@/lib/server/prefetch";

export default async function Page() {
  await requireSession("OWNER");
  return renderPrefetched(prefetchMyAcademy, <OwnerAcademyPageClient />);
}
`,
  },
  {
    file: "(protected)/owner/academy/edit/page.tsx",
    body: `import { OwnerAcademyEditPageClient } from "@/components/pages/owner/academy/edit/OwnerAcademyEditPageClient";
import { renderPrefetched } from "@/lib/server/render";
import { requireSession } from "@/lib/server/session";
import { prefetchMyAcademy } from "@/lib/server/prefetch";

export default async function Page() {
  await requireSession("OWNER");
  return renderPrefetched(prefetchMyAcademy, <OwnerAcademyEditPageClient />);
}
`,
  },
  {
    file: "(protected)/owner/billing/page.tsx",
    body: `import { OwnerBillingPageClient } from "@/components/pages/owner/billing/OwnerBillingPageClient";
import { renderPrefetched } from "@/lib/server/render";
import { requireSession } from "@/lib/server/session";
import { prefetchOwnerBilling } from "@/lib/server/prefetch";

export default async function Page() {
  await requireSession("OWNER");
  return renderPrefetched(prefetchOwnerBilling, <OwnerBillingPageClient />);
}
`,
  },
  {
    file: "(protected)/owner/courses/page.tsx",
    body: `import { OwnerCoursesPageClient } from "@/components/pages/owner/courses/OwnerCoursesPageClient";
import { renderPrefetched } from "@/lib/server/render";
import { requireSession } from "@/lib/server/session";
import { prefetchMyCourses } from "@/lib/server/prefetch";

export default async function Page() {
  await requireSession("OWNER");
  return renderPrefetched(prefetchMyCourses, <OwnerCoursesPageClient />);
}
`,
  },
  {
    file: "(protected)/owner/courses/create/page.tsx",
    body: `import { OwnerCoursesCreatePageClient } from "@/components/pages/owner/courses/create/OwnerCoursesCreatePageClient";
import { requireSession } from "@/lib/server/session";

export default async function Page() {
  await requireSession("OWNER");
  return <OwnerCoursesCreatePageClient />;
}
`,
  },
  {
    file: "(protected)/owner/courses/[id]/content/page.tsx",
    body: `import { OwnerCoursesidContentPageClient } from "@/components/pages/owner/courses/[id]/content/OwnerCoursesidContentPageClient";
import { renderPrefetched } from "@/lib/server/render";
import { requireSession } from "@/lib/server/session";
import { prefetchCourseSections } from "@/lib/server/prefetch";

type PageProps = { params: Promise<{ id: string }> };

export default async function Page({ params }: PageProps) {
  await requireSession("OWNER");
  const { id } = await params;
  return renderPrefetched(
    (qc) => prefetchCourseSections(qc, id),
    <OwnerCoursesidContentPageClient />,
  );
}
`,
  },
  {
    file: "(protected)/owner/courses/[id]/settings/page.tsx",
    body: `import { OwnerCoursesidSettingsPageClient } from "@/components/pages/owner/courses/[id]/settings/OwnerCoursesidSettingsPageClient";
import { renderPrefetched } from "@/lib/server/render";
import { requireSession } from "@/lib/server/session";
import { prefetchOwnerCourse } from "@/lib/server/prefetch";

type PageProps = { params: Promise<{ id: string }> };

export default async function Page({ params }: PageProps) {
  await requireSession("OWNER");
  const { id } = await params;
  return renderPrefetched(
    (qc) => prefetchOwnerCourse(qc, id),
    <OwnerCoursesidSettingsPageClient />,
  );
}
`,
  },
  {
    file: "(protected)/owner/courses/[id]/students/page.tsx",
    body: `import { OwnerCoursesidStudentsPageClient } from "@/components/pages/owner/courses/[id]/students/OwnerCoursesidStudentsPageClient";
import { renderPrefetched } from "@/lib/server/render";
import { requireSession } from "@/lib/server/session";
import { prefetchCourseStudents } from "@/lib/server/prefetch";

type PageProps = { params: Promise<{ id: string }> };

export default async function Page({ params }: PageProps) {
  await requireSession("OWNER");
  const { id } = await params;
  return renderPrefetched(
    (qc) => prefetchCourseStudents(qc, id),
    <OwnerCoursesidStudentsPageClient />,
  );
}
`,
  },
  {
    file: "(protected)/owner/courses/[id]/announcements/page.tsx",
    body: `import { OwnerCoursesidAnnouncementsPageClient } from "@/components/pages/owner/courses/[id]/announcements/OwnerCoursesidAnnouncementsPageClient";
import { renderPrefetched } from "@/lib/server/render";
import { requireSession } from "@/lib/server/session";
import { prefetchCourseAnnouncements } from "@/lib/server/prefetch";

type PageProps = { params: Promise<{ id: string }> };

export default async function Page({ params }: PageProps) {
  await requireSession("OWNER");
  const { id } = await params;
  return renderPrefetched(
    (qc) => prefetchCourseAnnouncements(qc, id),
    <OwnerCoursesidAnnouncementsPageClient />,
  );
}
`,
  },
  {
    file: "(protected)/owner/enrollments/page.tsx",
    body: `import { OwnerEnrollmentsPageClient } from "@/components/pages/owner/enrollments/OwnerEnrollmentsPageClient";
import { renderPrefetched } from "@/lib/server/render";
import { requireSession } from "@/lib/server/session";
import { prefetchOwnerEnrollments } from "@/lib/server/prefetch";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function Page({ searchParams }: PageProps) {
  await requireSession("OWNER");
  const sp = await searchParams;
  return renderPrefetched(
    (qc) => prefetchOwnerEnrollments(qc, sp),
    <OwnerEnrollmentsPageClient />,
  );
}
`,
  },
  {
    file: "(protected)/owner/enrollments/[enrollmentId]/page.tsx",
    body: `import { OwnerEnrollmentsenrollmentIdPageClient } from "@/components/pages/owner/enrollments/[enrollmentId]/OwnerEnrollmentsenrollmentIdPageClient";
import { renderPrefetched } from "@/lib/server/render";
import { requireSession } from "@/lib/server/session";
import { prefetchEnrollmentDetail } from "@/lib/server/prefetch";

type PageProps = { params: Promise<{ enrollmentId: string }> };

export default async function Page({ params }: PageProps) {
  await requireSession("OWNER");
  const { enrollmentId } = await params;
  return renderPrefetched(
    (qc) => prefetchEnrollmentDetail(qc, enrollmentId),
    <OwnerEnrollmentsenrollmentIdPageClient />,
  );
}
`,
  },
];

for (const { file, body } of pages) {
  const fullPath = path.join(appDir, file);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, body);
  console.log("Updated:", file);
}
