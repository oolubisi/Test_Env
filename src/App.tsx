/* ───────────────────────────────────────────
   App — HashRouter with Layout wrapping
   ─────────────────────────────────────────── */

import { Route, Switch } from "wouter";
import Layout from "@/components/Layout";

/* Page placeholders — real pages implemented by page agents */
import Dashboard from "@/pages/Dashboard";
import Vendors from "@/pages/Vendors";
import Accounts from "@/pages/Accounts";
import Reports from "@/pages/Reports";
import Letterhead from "@/pages/Letterhead";
import ProjectConsole from "@/pages/ProjectConsole";

export default function App() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/vendors" component={Vendors} />
        <Route path="/accounts" component={Accounts} />
        <Route path="/reports" component={Reports} />
        <Route path="/letterhead" component={Letterhead} />
        <Route path="/console/:projectId">
          {(params: Record<string, string>) => <ProjectConsole projectId={params.projectId} />}
        </Route>
        <Route path="/console/:projectId/:segment">
          {(params: Record<string, string>) => (
            <ProjectConsole
              projectId={params.projectId}
              segment={params.segment}
            />
          )}
        </Route>
        <Route>
          <div className="text-center py-20 text-muted-foreground">
            <h2 className="text-lg font-semibold mb-2">Page Not Found</h2>
            <p>The page you are looking for does not exist.</p>
          </div>
        </Route>
      </Switch>
    </Layout>
  );
}
