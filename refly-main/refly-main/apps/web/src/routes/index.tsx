import { Suspense } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import {
  BetaProtectedRoute,
  RequestAccessRoute,
} from '@refly-packages/ai-workspace-common/components/request-access/protected-route';
import { LightLoading } from '@refly/ui-kit';
import { HomeRedirect } from '@refly-packages/ai-workspace-common/components/home-redirect';

// Lazy load components
import {
  UnsignedFrontPage as Home,
  CanvasPage as Canvas,
  Pricing,
  ShareCanvasPage,
  ShareCodePage,
  SharePagePage,
  TemplatePreviewPage,
  SkillResponseSharePage,
  DocumentSharePage,
  ArtifactGalleryPage,
  UseCasesGalleryPage,
  ProjectPage,
} from '@refly/web-core';

export const AppRouter = (props: { layout?: any }) => {
  const { layout: Layout } = props;

  const hasBetaAccess = true;

  return (
    <Layout>
      <Suspense fallback={<LightLoading />}>
        <Routes>
          <Route path="/" element={<HomeRedirect defaultNode={<Home />} />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/share/canvas/:canvasId" element={<ShareCanvasPage />} />
          <Route path="/share/code/:shareId" element={<ShareCodePage />} />
          <Route path="/share/answer/:shareId" element={<SkillResponseSharePage />} />
          <Route path="/share/doc/:shareId" element={<DocumentSharePage />} />
          <Route path="/share/pages/:shareId" element={<SharePagePage />} />
          <Route path="/artifact-gallery" element={<ArtifactGalleryPage />} />
          <Route path="/use-cases-gallery" element={<UseCasesGalleryPage />} />
          <Route path="/preview/canvas/:shareId" element={<TemplatePreviewPage />} />
          <Route path="/canvas/" element={<Navigate to="/canvas/empty" replace />} />
          <Route
            path="/canvas/:canvasId"
            element={<BetaProtectedRoute component={Canvas} hasBetaAccess={hasBetaAccess} />}
          />
          <Route path="/project/:projectId" element={<ProjectPage />} />
          <Route
            path="/request-access"
            element={<RequestAccessRoute hasBetaAccess={hasBetaAccess} />}
          />
        </Routes>
      </Suspense>
    </Layout>
  );
};
