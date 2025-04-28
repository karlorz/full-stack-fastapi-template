# Release Notes

## Latest Changes

* 👷 Add REDIS_SERVER to builder deployment manifest. PR [#585](https://github.com/fastapilabs/cloud/pull/585) by [@tiangolo](https://github.com/tiangolo).
* 👷 Do not sync labels as it overrides manually added labels. PR [#216](https://github.com/fastapilabs/cloud/pull/216) by [@tiangolo](https://github.com/tiangolo).
* ✨ Redirect user to login if we get 401/403. PR [#196](https://github.com/fastapilabs/cloud/pull/196) by [@patrick91](https://github.com/patrick91).
* ✨ Redirect if not logged in device authorization page. PR [#177](https://github.com/fastapilabs/cloud/pull/177) by [@patrick91](https://github.com/patrick91).
* ✨ Add redis configuration. PR [#158](https://github.com/fastapilabs/cloud/pull/158) by [@patrick91](https://github.com/patrick91).
* 🚨 Add missing dependencies. PR [#132](https://github.com/fastapilabs/cloud/pull/132) by [@patrick91](https://github.com/patrick91).
* 🚸 Add minLength to team name and user full name. PR [#131](https://github.com/fastapilabs/cloud/pull/131) by [@patrick91](https://github.com/patrick91).
* 🤡 Use timeout to prevent firing the mutation twice. PR [#102](https://github.com/fastapilabs/cloud/pull/102) by [@patrick91](https://github.com/patrick91).
* 🎨 Lint. PR [#100](https://github.com/fastapilabs/cloud/pull/100) by [@alejsdev](https://github.com/alejsdev).
* 🔧 Ignore `src/routeTree.gen.ts` in biome. PR [#35](https://github.com/fastapilabs/cloud/pull/35) by [@patrick91](https://github.com/patrick91).
* 🚸 Improve login form. PR [#26](https://github.com/fastapilabs/cloud/pull/26) by [@patrick91](https://github.com/patrick91).
* ♻️ Upgrade. PR [#14](https://github.com/fastapilabs/cloud/pull/14) by [@alejsdev](https://github.com/alejsdev).
* 🆙 Update React Query to TanStack Query. PR [#1153](https://github.com/tiangolo/full-stack-fastapi-template/pull/1153) by [@patrick91](https://github.com/patrick91).
* Bump vite from 5.0.12 to 5.0.13 in /frontend. PR [#1149](https://github.com/tiangolo/full-stack-fastapi-template/pull/1149) by [@dependabot[bot]](https://github.com/apps/dependabot).
* 🔥 Remove ESLint and Prettier from pre-commit config. PR [#1096](https://github.com/tiangolo/full-stack-fastapi-template/pull/1096) by [@alejsdev](https://github.com/alejsdev).
* 📝 Update `README.md`. PR [#716](https://github.com/tiangolo/full-stack-fastapi-template/pull/716) by [@alejsdev](https://github.com/alejsdev).

### Features

* ✨ Add `Response.redirect` and tests. PR [#747](https://github.com/fastapilabs/cloud/pull/747) by [@patrick91](https://github.com/patrick91).
* 🛂 Migrate frontend to Shadcn. PR [#679](https://github.com/fastapilabs/cloud/pull/679) by [@alejsdev](https://github.com/alejsdev).
* ✨ Implement polling and enhance deployment view with real-time updates. PR [#672](https://github.com/fastapilabs/cloud/pull/672) by [@alejsdev](https://github.com/alejsdev).
* ✨ Add support to transfer a team. PR [#656](https://github.com/fastapilabs/cloud/pull/656) by [@alejsdev](https://github.com/alejsdev).
* ✨ Add API to stream build logs. PR [#666](https://github.com/fastapilabs/cloud/pull/666) by [@patrick91](https://github.com/patrick91).
* ✨ Don't fail if we can't send emails. PR [#665](https://github.com/fastapilabs/cloud/pull/665) by [@patrick91](https://github.com/patrick91).
* ✨ Add support for deploying private Knative services and builder on Knative. PR [#653](https://github.com/fastapilabs/cloud/pull/653) by [@tiangolo](https://github.com/tiangolo).
* ✨ Add country selector to waitlist. PR [#624](https://github.com/fastapilabs/cloud/pull/624) by [@alejsdev](https://github.com/alejsdev).
* ✨ Bump built Python to 3.13. PR [#596](https://github.com/fastapilabs/cloud/pull/596) by [@patrick91](https://github.com/patrick91).
* ✨API to allow user in. PR [#610](https://github.com/fastapilabs/cloud/pull/610) by [@patrick91](https://github.com/patrick91).
* ✨ Add waitlist signup page. PR [#607](https://github.com/fastapilabs/cloud/pull/607) by [@patrick91](https://github.com/patrick91).
* ✨ Add support for requirements.txt, pyproject.toml and nothing using single docker file. PR [#593](https://github.com/fastapilabs/cloud/pull/593) by [@patrick91](https://github.com/patrick91).
* ✨ Add backend to create NATS JetStream for logs and read them. PR [#582](https://github.com/fastapilabs/cloud/pull/582) by [@tiangolo](https://github.com/tiangolo).
* ✨ Logs UI. PR [#594](https://github.com/fastapilabs/cloud/pull/594) by [@alejsdev](https://github.com/alejsdev).
* ✨ Add new statuses to deployment. PR [#578](https://github.com/fastapilabs/cloud/pull/578) by [@patrick91](https://github.com/patrick91).
* ✨ Use SQS to communicate to builder, includes localstack, and new messenger. PR [#548](https://github.com/fastapilabs/cloud/pull/548) by [@tiangolo](https://github.com/tiangolo).
* ✨ Cards on the main dashboard page. PR [#539](https://github.com/fastapilabs/cloud/pull/539) by [@alejsdev](https://github.com/alejsdev).
* ✨ Expose dashboard url on deployment api. PR [#521](https://github.com/fastapilabs/cloud/pull/521) by [@patrick91](https://github.com/patrick91).
* ✨ Add link to home page on logo. PR [#529](https://github.com/fastapilabs/cloud/pull/529) by [@patrick91](https://github.com/patrick91).
* ✨ Add support for our custom domains for the API, same domain as dashboard. PR [#508](https://github.com/fastapilabs/cloud/pull/508) by [@tiangolo](https://github.com/tiangolo).
* ✨ Add first Cloudflare utils for custom domains. PR [#501](https://github.com/fastapilabs/cloud/pull/501) by [@tiangolo](https://github.com/tiangolo).
* 👔 App stale API on env var changes. PR [#482](https://github.com/fastapilabs/cloud/pull/482) by [@estebanx64](https://github.com/estebanx64).
* ✨ Add services to redeploy an app in builder. PR [#483](https://github.com/fastapilabs/cloud/pull/483) by [@estebanx64](https://github.com/estebanx64).
* ✨ Add waiting list API, models, and emails. PR [#457](https://github.com/fastapilabs/cloud/pull/457) by [@estebanx64](https://github.com/estebanx64).
* ✨ Implement environment variables UI. PR [#375](https://github.com/fastapilabs/cloud/pull/375) by [@patrick91](https://github.com/patrick91).
* ✨ API to batch update environment variables. PR [#384](https://github.com/fastapilabs/cloud/pull/384) by [@patrick91](https://github.com/patrick91).
* ✨Add API for environment variables. PR [#374](https://github.com/fastapilabs/cloud/pull/374) by [@patrick91](https://github.com/patrick91).
* ✨ Add team selector. PR [#335](https://github.com/fastapilabs/cloud/pull/335) by [@alejsdev](https://github.com/alejsdev).
* ✨ Add single deployment page. PR [#349](https://github.com/fastapilabs/cloud/pull/349) by [@patrick91](https://github.com/patrick91).
* ✨ Add docker builder script. PR [#254](https://github.com/fastapilabs/cloud/pull/254) by [@estebanx64](https://github.com/estebanx64).
* ✨ Add url on deployment. PR [#264](https://github.com/fastapilabs/cloud/pull/264) by [@patrick91](https://github.com/patrick91).
* ✨ View apps with deployments and delete app. PR [#257](https://github.com/fastapilabs/cloud/pull/257) by [@alejsdev](https://github.com/alejsdev).
* ✨ Add endpoint to delete app. PR [#259](https://github.com/fastapilabs/cloud/pull/259) by [@alejsdev](https://github.com/alejsdev).
* ✨ Add endpoint to read single app. PR [#258](https://github.com/fastapilabs/cloud/pull/258) by [@alejsdev](https://github.com/alejsdev).
* ✨ Add API to read single deployment. PR [#253](https://github.com/fastapilabs/cloud/pull/253) by [@patrick91](https://github.com/patrick91).
* ✨ Add footer. PR [#250](https://github.com/fastapilabs/cloud/pull/250) by [@alejsdev](https://github.com/alejsdev).
* ✨ Add deployment presigned url service and logic. PR [#239](https://github.com/fastapilabs/cloud/pull/239) by [@estebanx64](https://github.com/estebanx64).
* ✨ Add upload artifact endpoint. PR [#234](https://github.com/fastapilabs/cloud/pull/234) by [@alejsdev](https://github.com/alejsdev).
* ✅ Add apps e2e tests. PR [#227](https://github.com/fastapilabs/cloud/pull/227) by [@alejsdev](https://github.com/alejsdev).
* ✨ Add read deployments endpoint. PR [#235](https://github.com/fastapilabs/cloud/pull/235) by [@alejsdev](https://github.com/alejsdev).
* ✨ Add endpoint to create a deployment. PR [#219](https://github.com/fastapilabs/cloud/pull/219) by [@alejsdev](https://github.com/alejsdev).
* ✨ Read apps. PR [#218](https://github.com/fastapilabs/cloud/pull/218) by [@alejsdev](https://github.com/alejsdev).
* ✨ Create an app. PR [#207](https://github.com/fastapilabs/cloud/pull/207) by [@alejsdev](https://github.com/alejsdev).
* ✨ Add endpoint to read apps. PR [#214](https://github.com/fastapilabs/cloud/pull/214) by [@alejsdev](https://github.com/alejsdev).
* ✨ Add endpoint to create an app. PR [#202](https://github.com/fastapilabs/cloud/pull/202) by [@alejsdev](https://github.com/alejsdev).
* ✨ Add rate limit to device authorization endpoints. PR [#183](https://github.com/fastapilabs/cloud/pull/183) by [@patrick91](https://github.com/patrick91).
* 🗃️ New DB models for apps and deployments. PR [#198](https://github.com/fastapilabs/cloud/pull/198) by [@alejsdev](https://github.com/alejsdev).
* ✨ Use full layout in device auth screen. PR [#179](https://github.com/fastapilabs/cloud/pull/179) by [@patrick91](https://github.com/patrick91).
* ✨ Don't allow removing user account if owning teams . PR [#152](https://github.com/fastapilabs/cloud/pull/152) by [@alejsdev](https://github.com/alejsdev).
* ✨ Show authorization info in authorize page. PR [#175](https://github.com/fastapilabs/cloud/pull/175) by [@patrick91](https://github.com/patrick91).
* ✨ Add request information to authorization requests. PR [#174](https://github.com/fastapilabs/cloud/pull/174) by [@patrick91](https://github.com/patrick91).
* ✨ Add page for user to authorize device login. PR [#172](https://github.com/fastapilabs/cloud/pull/172) by [@patrick91](https://github.com/patrick91).
* ✨ Add API to authorize device. PR [#171](https://github.com/fastapilabs/cloud/pull/171) by [@patrick91](https://github.com/patrick91).
* ✨ Add endpoint to fetch token. PR [#170](https://github.com/fastapilabs/cloud/pull/170) by [@patrick91](https://github.com/patrick91).
* ✨ Add endpoint to start device auth. PR [#159](https://github.com/fastapilabs/cloud/pull/159) by [@patrick91](https://github.com/patrick91).
* ✨ Delete team/user e2e tests. PR [#168](https://github.com/fastapilabs/cloud/pull/168) by [@alejsdev](https://github.com/alejsdev).
* ✨ Use a table to list all the teams and paginate. PR [#143](https://github.com/fastapilabs/cloud/pull/143) by [@patrick91](https://github.com/patrick91).
* ✨ Add `created_at` to team. PR [#147](https://github.com/fastapilabs/cloud/pull/147) by [@patrick91](https://github.com/patrick91).
* ✨ Add filter for owned teams. PR [#141](https://github.com/fastapilabs/cloud/pull/141) by [@patrick91](https://github.com/patrick91).
* ✨ Add owner id to team. PR [#135](https://github.com/fastapilabs/cloud/pull/135) by [@patrick91](https://github.com/patrick91).
* ✨ Account deletion notification email and update email confirmation. PR [#138](https://github.com/fastapilabs/cloud/pull/138) by [@alejsdev](https://github.com/alejsdev).
* ✨Add empty state and initial instructions to projects. PR [#150](https://github.com/fastapilabs/cloud/pull/150) by [@alejsdev](https://github.com/alejsdev).
* ✨ Add confirmation with input to delete team/user. PR [#146](https://github.com/fastapilabs/cloud/pull/146) by [@alejsdev](https://github.com/alejsdev).
* ✨ Add Knative setup (including Kourier, TLS certificates, default custom domain, semi-automatic install with Kustomize). PR [#139](https://github.com/fastapilabs/cloud/pull/139) by [@tiangolo](https://github.com/tiangolo).
* ✅ Add invitations tests. PR [#127](https://github.com/fastapilabs/cloud/pull/127) by [@alejsdev](https://github.com/alejsdev).
* 👷 Update CI with Pulumi, Helm, Kubernetes, enable AWS Load Balancer, ingress-nginx, HTTPS. PR [#129](https://github.com/fastapilabs/cloud/pull/129) by [@tiangolo](https://github.com/tiangolo).
* ✅ Update user settings tests. PR [#99](https://github.com/fastapilabs/cloud/pull/99) by [@alejsdev](https://github.com/alejsdev).
* ✅ Add team tests. PR [#126](https://github.com/fastapilabs/cloud/pull/126) by [@alejsdev](https://github.com/alejsdev).
* 👷 Update Pulumi, add AWS resources for AWS Load Balancer Controller. PR [#128](https://github.com/fastapilabs/cloud/pull/128) by [@tiangolo](https://github.com/tiangolo).
* ✅ Reset password tests. PR [#123](https://github.com/fastapilabs/cloud/pull/123) by [@alejsdev](https://github.com/alejsdev).
* ✅ Add login tests. PR [#121](https://github.com/fastapilabs/cloud/pull/121) by [@alejsdev](https://github.com/alejsdev).
* ✅ Update sign up tests. PR [#116](https://github.com/fastapilabs/cloud/pull/116) by [@alejsdev](https://github.com/alejsdev).
* ✨ Allow to filter invitations by status. PR [#98](https://github.com/fastapilabs/cloud/pull/98) by [@patrick91](https://github.com/patrick91).
* ✅ Add test for signing up and setup for dev `mailcatcher`. PR [#115](https://github.com/fastapilabs/cloud/pull/115) by [@patrick91](https://github.com/patrick91).
* ✨ Allow users to select team in user menu and all teams view. PR [#105](https://github.com/fastapilabs/cloud/pull/105) by [@alejsdev](https://github.com/alejsdev).
* 🔧 Update Pulumi config to add IAM role with access entries. PR [#108](https://github.com/fastapilabs/cloud/pull/108) by [@tiangolo](https://github.com/tiangolo).
* ✨ Add pagination to team invitations. PR [#97](https://github.com/fastapilabs/cloud/pull/97) by [@patrick91](https://github.com/patrick91).
* ✨ Add first Pulumi configs and files to deploy Kubernetes to AWS. PR [#104](https://github.com/fastapilabs/cloud/pull/104) by [@tiangolo](https://github.com/tiangolo).
* ✨ Add initial tests. PR [#94](https://github.com/fastapilabs/cloud/pull/94) by [@alejsdev](https://github.com/alejsdev).
* ✨ Email verification . PR [#84](https://github.com/fastapilabs/cloud/pull/84) by [@alejsdev](https://github.com/alejsdev).
* ✨ Add auth to Playwright and update setup. PR [#90](https://github.com/fastapilabs/cloud/pull/90) by [@alejsdev](https://github.com/alejsdev).
* ✨ Use personal team slug instead of hardcoded one. PR [#86](https://github.com/fastapilabs/cloud/pull/86) by [@patrick91](https://github.com/patrick91).
* ✨ Add initial setup for Playwright. PR [#88](https://github.com/fastapilabs/cloud/pull/88) by [@alejsdev](https://github.com/alejsdev).
* ✨ Expose personal team slug instead of id. PR [#85](https://github.com/fastapilabs/cloud/pull/85) by [@patrick91](https://github.com/patrick91).
* ✨Prevent deletion of personal team. PR [#83](https://github.com/fastapilabs/cloud/pull/83) by [@patrick91](https://github.com/patrick91).
* ✨ Add and expose personal team on user. PR [#79](https://github.com/fastapilabs/cloud/pull/79) by [@patrick91](https://github.com/patrick91).
* ✨ Accept invitations. PR [#71](https://github.com/fastapilabs/cloud/pull/71) by [@alejsdev](https://github.com/alejsdev).
* ✨ Add email verification flow feature. PR [#75](https://github.com/fastapilabs/cloud/pull/75) by [@estebanx64](https://github.com/estebanx64).
* ✨ Create new invitations . PR [#67](https://github.com/fastapilabs/cloud/pull/67) by [@alejsdev](https://github.com/alejsdev).
* ✨ Cancel invitations. PR [#68](https://github.com/fastapilabs/cloud/pull/68) by [@alejsdev](https://github.com/alejsdev).
* ✨ Allow users to see invitations sent. PR [#57](https://github.com/fastapilabs/cloud/pull/57) by [@alejsdev](https://github.com/alejsdev).
* ✨ Add Team Settings. PR [#52](https://github.com/fastapilabs/cloud/pull/52) by [@alejsdev](https://github.com/alejsdev).
* ✨ Add invitations logic for backend and emails. PR [#39](https://github.com/fastapilabs/cloud/pull/39) by [@estebanx64](https://github.com/estebanx64).
* ✨ Delete a team. PR [#42](https://github.com/fastapilabs/cloud/pull/42) by [@alejsdev](https://github.com/alejsdev).
* ✨ Edit Team and other tweaks. PR [#40](https://github.com/fastapilabs/cloud/pull/40) by [@alejsdev](https://github.com/alejsdev).
* 🗃️ Add invitations table definition. PR [#25](https://github.com/fastapilabs/cloud/pull/25) by [@estebanx64](https://github.com/estebanx64).
* ✨ View organizations. PR [#27](https://github.com/fastapilabs/cloud/pull/27) by [@alejsdev](https://github.com/alejsdev).
* ✨ Create an organization. PR [#20](https://github.com/fastapilabs/cloud/pull/20) by [@alejsdev](https://github.com/alejsdev).
* ✨ Add organizations initial routes. PR [#16](https://github.com/fastapilabs/cloud/pull/16) by [@estebanx64](https://github.com/estebanx64).
* ✨ Add SignUp and Login views. PR [#15](https://github.com/fastapilabs/cloud/pull/15) by [@alejsdev](https://github.com/alejsdev).
* ✨ Add role, organization and UserOrganization link table. PR [#9](https://github.com/fastapilabs/cloud/pull/9) by [@estebanx64](https://github.com/estebanx64).
* ✨ Add support for deploying multiple environments (staging, production) to the same server. PR [#1128](https://github.com/tiangolo/full-stack-fastapi-template/pull/1128) by [@tiangolo](https://github.com/tiangolo).
* 👷 Update CI GitHub Actions to allow running in private repos. PR [#1125](https://github.com/tiangolo/full-stack-fastapi-template/pull/1125) by [@tiangolo](https://github.com/tiangolo).

### Fixes

* 🐛 Update authentication error handling to return 401 Unauthorized for invalid credentials. PR [#781](https://github.com/fastapilabs/cloud/pull/781) by [@alejsdev](https://github.com/alejsdev).
* 🐛 Fix logout refresh bug. PR [#695](https://github.com/fastapilabs/cloud/pull/695) by [@alejsdev](https://github.com/alejsdev).
* 🐛 Allow scrolling when dropdown menu is open. PR [#689](https://github.com/fastapilabs/cloud/pull/689) by [@alejsdev](https://github.com/alejsdev).
* 🐛 Improve logs responsiveness and add auto-scrolling to logs view on new log entries . PR [#675](https://github.com/fastapilabs/cloud/pull/675) by [@alejsdev](https://github.com/alejsdev).
* 🐛 Refactor reset password logic to improve token handling . PR [#674](https://github.com/fastapilabs/cloud/pull/674) by [@alejsdev](https://github.com/alejsdev).
* 🐛 Fix `can_signup`. PR [#662](https://github.com/fastapilabs/cloud/pull/662) by [@patrick91](https://github.com/patrick91).
* 🐛 Restructure `new-app` route to avoid conflict with app named `new`. PR [#654](https://github.com/fastapilabs/cloud/pull/654) by [@alejsdev](https://github.com/alejsdev).
* 🐛 Fix missing password validation rules in ChangePassword component. PR [#634](https://github.com/fastapilabs/cloud/pull/634) by [@alejsdev](https://github.com/alejsdev).
* 🐛 Reduce interval for refetching deployments. PR [#632](https://github.com/fastapilabs/cloud/pull/632) by [@patrick91](https://github.com/patrick91).
* 🐛 Fix bug with waitlist team size select. PR [#621](https://github.com/fastapilabs/cloud/pull/621) by [@patrick91](https://github.com/patrick91).
* 🚨 Fix `<div>` cannot appear as a descendant of `<p>`. PR [#620](https://github.com/fastapilabs/cloud/pull/620) by [@alejsdev](https://github.com/alejsdev).
* 🐛 Include install_dependencies.sh in Docker context directory for building. PR [#613](https://github.com/fastapilabs/cloud/pull/613) by [@tiangolo](https://github.com/tiangolo).
* 🚨 Fix `suppression comment has no effect` . PR [#612](https://github.com/fastapilabs/cloud/pull/612) by [@alejsdev](https://github.com/alejsdev).
* 🐛 Do not lru_cache the async depot functions. PR [#602](https://github.com/fastapilabs/cloud/pull/602) by [@tiangolo](https://github.com/tiangolo).
* 🐛 Fix team name not being updated in sidebar. PR [#598](https://github.com/fastapilabs/cloud/pull/598) by [@patrick91](https://github.com/patrick91).
* 🐛 Remove team from local storage when there's an error. PR [#597](https://github.com/fastapilabs/cloud/pull/597) by [@patrick91](https://github.com/patrick91).
* 🐛 Fix bug when hovering a team with a duplicated name in the team selector. PR [#562](https://github.com/fastapilabs/cloud/pull/562) by [@alejsdev](https://github.com/alejsdev).
* 🐛 Remove `https` prefix from `dashboard_url`. PR [#561](https://github.com/fastapilabs/cloud/pull/561) by [@patrick91](https://github.com/patrick91).
* 👷 Fix localstack config with env vars for CI deployments. PR [#554](https://github.com/fastapilabs/cloud/pull/554) by [@tiangolo](https://github.com/tiangolo).
* 🐛 Handle invalid team or appId URLs using `notFound` utility. PR [#523](https://github.com/fastapilabs/cloud/pull/523) by [@alejsdev](https://github.com/alejsdev).
* 🐛 Fix service account and permissions for our services. PR [#512](https://github.com/fastapilabs/cloud/pull/512) by [@tiangolo](https://github.com/tiangolo).
* 🐛 Fix deployments from CI, that I broke with the env var. PR [#509](https://github.com/fastapilabs/cloud/pull/509) by [@tiangolo](https://github.com/tiangolo).
* 🐛 Use light mode on auth pages. PR [#400](https://github.com/fastapilabs/cloud/pull/400) by [@patrick91](https://github.com/patrick91).
* 🐛 Fix empty team after visiting a non-team/general URL. PR [#371](https://github.com/fastapilabs/cloud/pull/371) by [@alejsdev](https://github.com/alejsdev).
* 🐛 Fix stale data when creating and loading apps. PR [#383](https://github.com/fastapilabs/cloud/pull/383) by [@patrick91](https://github.com/patrick91).
* 🐛 Update `min_length` in UserUpdateMe and TeamUpdate models and update frontend validations. PR [#356](https://github.com/fastapilabs/cloud/pull/356) by [@alejsdev](https://github.com/alejsdev).
* 🐛 Fix TODOs. PR [#283](https://github.com/fastapilabs/cloud/pull/283) by [@alejsdev](https://github.com/alejsdev).
* 🐛 Fix email validation in EditableField. PR [#195](https://github.com/fastapilabs/cloud/pull/195) by [@patrick91](https://github.com/patrick91).
* 🚨 Add biome-ignore. PR [#166](https://github.com/fastapilabs/cloud/pull/166) by [@alejsdev](https://github.com/alejsdev).
* 🐛 Limit the number of displayed teams in User Menu. PR [#133](https://github.com/fastapilabs/cloud/pull/133) by [@alejsdev](https://github.com/alejsdev).
* 🐛 Add min length validation. PR [#130](https://github.com/fastapilabs/cloud/pull/130) by [@patrick91](https://github.com/patrick91).
* 🐛 Redirect logged-in users from signup to home page. PR [#122](https://github.com/fastapilabs/cloud/pull/122) by [@alejsdev](https://github.com/alejsdev).
* 🐛 Add maxsplit to allow emails with `-` in them. PR [#114](https://github.com/fastapilabs/cloud/pull/114) by [@patrick91](https://github.com/patrick91).
* 🚨 Fix `tbody> cannot appear as a child of <tbody>`. PR [#107](https://github.com/fastapilabs/cloud/pull/107) by [@alejsdev](https://github.com/alejsdev).
* 🩹 Fix font path. PR [#96](https://github.com/fastapilabs/cloud/pull/96) by [@patrick91](https://github.com/patrick91).
* 🚨 Fix `<div>` cannot appear as a descendant of `<p>`. PR [#77](https://github.com/fastapilabs/cloud/pull/77) by [@alejsdev](https://github.com/alejsdev).
* 🐛 Fix error 500 when creating invitation. PR [#60](https://github.com/fastapilabs/cloud/pull/60) by [@alejsdev](https://github.com/alejsdev).
* 🐛 Fix logout bug and invalidate queries. PR [#50](https://github.com/fastapilabs/cloud/pull/50) by [@alejsdev](https://github.com/alejsdev).
* 🐛 Fix "A component suspended while responding to synchronous input". PR [#41](https://github.com/fastapilabs/cloud/pull/41) by [@patrick91](https://github.com/patrick91).
* 🚨 Fix `<div>` cannot appear as a descendant of `<p>`. PR [#38](https://github.com/fastapilabs/cloud/pull/38) by [@patrick91](https://github.com/patrick91).
* 🐛 Fix bug, refactor utils and update regex for password. PR [#31](https://github.com/fastapilabs/cloud/pull/31) by [@alejsdev](https://github.com/alejsdev).
* 🐛 Fix bug in update_organization and refactor test. PR [#29](https://github.com/fastapilabs/cloud/pull/29) by [@alejsdev](https://github.com/alejsdev).
* 🐛 Fix 403 when the frontend has a directory without an index.html. PR [#1094](https://github.com/tiangolo/full-stack-fastapi-template/pull/1094) by [@tiangolo](https://github.com/tiangolo).

### Refactors

* ♻️ Enable forward proxy headers in FastAPI apps, API and customer's apps. PR [#745](https://github.com/fastapilabs/cloud/pull/745) by [@tiangolo](https://github.com/tiangolo).
* 🍱 Update logo for favicon and email templates. PR [#753](https://github.com/fastapilabs/cloud/pull/753) by [@alejsdev](https://github.com/alejsdev).
* ♻️ Make app slug names have a default of 5 characters minimum, shorter app names will get a slug. PR [#742](https://github.com/fastapilabs/cloud/pull/742) by [@tiangolo](https://github.com/tiangolo).
* ♻️ Fix the opening/closing of Change Role and Remove User dialogs. PR [#743](https://github.com/fastapilabs/cloud/pull/743) by [@alejsdev](https://github.com/alejsdev).
* 🧹 Post-migration cleanup and adjustments. PR [#741](https://github.com/fastapilabs/cloud/pull/741) by [@alejsdev](https://github.com/alejsdev).
* ♻️ Refactor loaders to avoid using stale data. PR [#732](https://github.com/fastapilabs/cloud/pull/732) by [@alejsdev](https://github.com/alejsdev).
* 🍱 Update logo. PR [#727](https://github.com/fastapilabs/cloud/pull/727) by [@alejsdev](https://github.com/alejsdev).
* ✨ Add scramble text effect to NotFound component and improve styling. PR [#723](https://github.com/fastapilabs/cloud/pull/723) by [@alejsdev](https://github.com/alejsdev).
* ♻️ Refactor Sidebar. PR [#694](https://github.com/fastapilabs/cloud/pull/694) by [@alejsdev](https://github.com/alejsdev).
* 💄 Update email templates styles for consistency. PR [#676](https://github.com/fastapilabs/cloud/pull/676) by [@alejsdev](https://github.com/alejsdev).
* ⬆️  Bump backend dependencies and tweak `computed_field` for compatibility with Pydantic and SQLModel. PR [#687](https://github.com/fastapilabs/cloud/pull/687) by [@patrick91](https://github.com/patrick91).
* 💄 Polish UI. PR [#677](https://github.com/fastapilabs/cloud/pull/677) by [@alejsdev](https://github.com/alejsdev).
* 🔧 Add Bento and Sofie to allowed sign ups. PR [#678](https://github.com/fastapilabs/cloud/pull/678) by [@tiangolo](https://github.com/tiangolo).
* ♻️ Update alerts and device view . PR [#673](https://github.com/fastapilabs/cloud/pull/673) by [@alejsdev](https://github.com/alejsdev).
* ♻️ Add temporary Quickstart for first users. PR [#668](https://github.com/fastapilabs/cloud/pull/668) by [@alejsdev](https://github.com/alejsdev).
* ♻️ Update email templates to use new png logo. PR [#670](https://github.com/fastapilabs/cloud/pull/670) by [@alejsdev](https://github.com/alejsdev).
* ♻️ Add missing states and refactor deployment status handling. PR [#671](https://github.com/fastapilabs/cloud/pull/671) by [@alejsdev](https://github.com/alejsdev).
* ✨ Update styling . PR [#669](https://github.com/fastapilabs/cloud/pull/669) by [@alejsdev](https://github.com/alejsdev).
* ♻️ Update layout to allow flexible width for name in dashboard greeting and restructure user information. PR [#667](https://github.com/fastapilabs/cloud/pull/667) by [@alejsdev](https://github.com/alejsdev).
* ✨ Create user in waiting list when they don't exist. PR [#664](https://github.com/fastapilabs/cloud/pull/664) by [@patrick91](https://github.com/patrick91).
* ♻️ Refactor toasts. PR [#658](https://github.com/fastapilabs/cloud/pull/658) by [@alejsdev](https://github.com/alejsdev).
* ♻️ Remove email from signup domains. PR [#663](https://github.com/fastapilabs/cloud/pull/663) by [@alejsdev](https://github.com/alejsdev).
* 🎨 Add frontend tweaks . PR [#657](https://github.com/fastapilabs/cloud/pull/657) by [@alejsdev](https://github.com/alejsdev).
* ♻️ Refactor settings, do not use computed_field, not needed. PR [#651](https://github.com/fastapilabs/cloud/pull/651) by [@tiangolo](https://github.com/tiangolo).
* ♻️ Do not crash messenger on errors. PR [#647](https://github.com/fastapilabs/cloud/pull/647) by [@tiangolo](https://github.com/tiangolo).
* 🔥 Remove tests that only test mocks. PR [#649](https://github.com/fastapilabs/cloud/pull/649) by [@tiangolo](https://github.com/tiangolo).
* ♻️ Responsiveness tweaks. PR [#633](https://github.com/fastapilabs/cloud/pull/633) by [@alejsdev](https://github.com/alejsdev).
* ♻️ Update external link. PR [#636](https://github.com/fastapilabs/cloud/pull/636) by [@alejsdev](https://github.com/alejsdev).
* ♻️ Update tagline. PR [#626](https://github.com/fastapilabs/cloud/pull/626) by [@alejsdev](https://github.com/alejsdev).
* 💄 Improve skeletons. PR [#628](https://github.com/fastapilabs/cloud/pull/628) by [@alejsdev](https://github.com/alejsdev).
* 🔥 Remove unnecessary styles. PR [#625](https://github.com/fastapilabs/cloud/pull/625) by [@alejsdev](https://github.com/alejsdev).
* ✅ Actually check if we are sending (or not) emails. PR [#618](https://github.com/fastapilabs/cloud/pull/618) by [@patrick91](https://github.com/patrick91).
* ♻️ Logs tweaks. PR [#623](https://github.com/fastapilabs/cloud/pull/623) by [@alejsdev](https://github.com/alejsdev).
* ♻️ Refactor logs. PR [#617](https://github.com/fastapilabs/cloud/pull/617) by [@alejsdev](https://github.com/alejsdev).
* ♻️ Add NATS config for local development. PR [#622](https://github.com/fastapilabs/cloud/pull/622) by [@alejsdev](https://github.com/alejsdev).
* ♻️ Stream logs from depot build. PR [#586](https://github.com/fastapilabs/cloud/pull/586) by [@patrick91](https://github.com/patrick91).
* ♻️  Move builder's Dockerfile to its own folder. PR [#595](https://github.com/fastapilabs/cloud/pull/595) by [@patrick91](https://github.com/patrick91).
* ♻️ Change team size to be an enum. PR [#604](https://github.com/fastapilabs/cloud/pull/604) by [@patrick91](https://github.com/patrick91).
* ♻️ Refactor NATS to use one single JetStream for logs for all apps. PR [#611](https://github.com/fastapilabs/cloud/pull/611) by [@tiangolo](https://github.com/tiangolo).
* ♻️ Do not use a single span/trace for the entire run of the messenger. PR [#603](https://github.com/fastapilabs/cloud/pull/603) by [@tiangolo](https://github.com/tiangolo).
* ♻️ Update builder to error out only on server error states. PR [#601](https://github.com/fastapilabs/cloud/pull/601) by [@tiangolo](https://github.com/tiangolo).
* ♻️  Add redis to common settings. PR [#580](https://github.com/fastapilabs/cloud/pull/580) by [@patrick91](https://github.com/patrick91).
* ♻️ Update LogFire to show logs on local development. PR [#575](https://github.com/fastapilabs/cloud/pull/575) by [@tiangolo](https://github.com/tiangolo).
* ♻️ Refactor builder at port 80001, for local development, support for local debugger for builder and messenger. PR [#574](https://github.com/fastapilabs/cloud/pull/574) by [@tiangolo](https://github.com/tiangolo).
* ♻️ Refactor builder to allow running it locally, using remote Depot, local Docker, registry, Kubernetes/Knative. PR [#560](https://github.com/fastapilabs/cloud/pull/560) by [@tiangolo](https://github.com/tiangolo).
* ♻️ Refactor usage of dotenv files, allow a local override, include backend deploy extra env vars for next PR. PR [#553](https://github.com/fastapilabs/cloud/pull/553) by [@tiangolo](https://github.com/tiangolo).
* 🎨 UI tweaks. PR [#547](https://github.com/fastapilabs/cloud/pull/547) by [@alejsdev](https://github.com/alejsdev).
* 🔥 Remove unused env vars and refactor as necessary. PR [#541](https://github.com/fastapilabs/cloud/pull/541) by [@tiangolo](https://github.com/tiangolo).
* ♻️ Use a single LogFire project to link traces. PR [#540](https://github.com/fastapilabs/cloud/pull/540) by [@tiangolo](https://github.com/tiangolo).
* 🔧 Update Sentry DSN. PR [#538](https://github.com/fastapilabs/cloud/pull/538) by [@tiangolo](https://github.com/tiangolo).
* ♻️ Refactor pagination. PR [#527](https://github.com/fastapilabs/cloud/pull/527) by [@alejsdev](https://github.com/alejsdev).
* 🛂 Migrate to Chakra UI v3. PR [#461](https://github.com/fastapilabs/cloud/pull/461) by [@alejsdev](https://github.com/alejsdev).
* ♻️ Add LogFire. PR [#517](https://github.com/fastapilabs/cloud/pull/517) by [@tiangolo](https://github.com/tiangolo).
* 🔊 Do not hide boto3 errors from our observability. PR [#514](https://github.com/fastapilabs/cloud/pull/514) by [@tiangolo](https://github.com/tiangolo).
* 🔥 Remove TriggerMesh. PR [#510](https://github.com/fastapilabs/cloud/pull/510) by [@tiangolo](https://github.com/tiangolo).
* ♻️ Pass Cloudflare config env vars to backend on deployment. PR [#507](https://github.com/fastapilabs/cloud/pull/507) by [@tiangolo](https://github.com/tiangolo).
* 🔧 Add BUILDER_SENTRY_DSN to builder deployment. PR [#505](https://github.com/fastapilabs/cloud/pull/505) by [@tiangolo](https://github.com/tiangolo).
* ♻️ Refactor builder to support calling Kubernetes locally, use our own settings. PR [#504](https://github.com/fastapilabs/cloud/pull/504) by [@tiangolo](https://github.com/tiangolo).
* ♻️ Set Sentry environment in builder and disable locally. PR [#502](https://github.com/fastapilabs/cloud/pull/502) by [@tiangolo](https://github.com/tiangolo).
* ♻️ Refactor `get_settings` util functions, couple with their respective classes. PR [#498](https://github.com/fastapilabs/cloud/pull/498) by [@tiangolo](https://github.com/tiangolo).
* ✅ Remove unused patches in tests. PR [#499](https://github.com/fastapilabs/cloud/pull/499) by [@tiangolo](https://github.com/tiangolo).
* 🎨 Rename upload complete route. PR [#497](https://github.com/fastapilabs/cloud/pull/497) by [@patrick91](https://github.com/patrick91).
* ♻️ Use Depot for customer builds instead of Docker in Docker. PR [#489](https://github.com/fastapilabs/cloud/pull/489) by [@tiangolo](https://github.com/tiangolo).
* ♻️ Refactor actions menu. PR [#480](https://github.com/fastapilabs/cloud/pull/480) by [@alejsdev](https://github.com/alejsdev).
* ♻️ Rename Update Email components. PR [#469](https://github.com/fastapilabs/cloud/pull/469) by [@alejsdev](https://github.com/alejsdev).
* 🎨 Fix two types in the UI. PR [#467](https://github.com/fastapilabs/cloud/pull/467) by [@tiangolo](https://github.com/tiangolo).
* 🔧 Add env vars for Playwright tests. PR [#465](https://github.com/fastapilabs/cloud/pull/465) by [@tiangolo](https://github.com/tiangolo).
* 💄 Improve color palette. PR [#436](https://github.com/fastapilabs/cloud/pull/436) by [@alejsdev](https://github.com/alejsdev).
* 🔒️ Disallow registering emails not from FastAPI Labs. PR [#451](https://github.com/fastapilabs/cloud/pull/451) by [@tiangolo](https://github.com/tiangolo).
* 🙈 Hide Google and Github auth options and Sign Up link. PR [#448](https://github.com/fastapilabs/cloud/pull/448) by [@alejsdev](https://github.com/alejsdev).
* ♻️ Refactor settings to allow builder to start with only needed env vars and add it to Docker Compose. PR [#445](https://github.com/fastapilabs/cloud/pull/445) by [@estebanx64](https://github.com/estebanx64).
* ♻️ Refactor app detail and add `RefetchInterval` to deployments query. PR [#441](https://github.com/fastapilabs/cloud/pull/441) by [@alejsdev](https://github.com/alejsdev).
* 💄 Redesign toasts. PR [#435](https://github.com/fastapilabs/cloud/pull/435) by [@alejsdev](https://github.com/alejsdev).
* ✅ Add delete app test. PR [#428](https://github.com/fastapilabs/cloud/pull/428) by [@alejsdev](https://github.com/alejsdev).
* ♻️ Refactor of settings to its own lru_cache function. PR [#434](https://github.com/fastapilabs/cloud/pull/434) by [@tiangolo](https://github.com/tiangolo).
* 💄 Add icons to environment variables . PR [#421](https://github.com/fastapilabs/cloud/pull/421) by [@alejsdev](https://github.com/alejsdev).
* 📱 Improve responsiveness in auth pages. PR [#432](https://github.com/fastapilabs/cloud/pull/432) by [@alejsdev](https://github.com/alejsdev).
* ♻️ Refactor and simplify Pulumi code. PR [#425](https://github.com/fastapilabs/cloud/pull/425) by [@tiangolo](https://github.com/tiangolo).
* ♻️ Refactor Team Settings. PR [#402](https://github.com/fastapilabs/cloud/pull/402) by [@alejsdev](https://github.com/alejsdev).
* 👷 Update AWS and Kubernetes deployment configs and instructions. PR [#418](https://github.com/fastapilabs/cloud/pull/418) by [@tiangolo](https://github.com/tiangolo).
* ♻️ Add active style to Sidebar. PR [#411](https://github.com/fastapilabs/cloud/pull/411) by [@alejsdev](https://github.com/alejsdev).
* ♻️ Use modal for accept invitation. PR [#393](https://github.com/fastapilabs/cloud/pull/393) by [@alejsdev](https://github.com/alejsdev).
* ♻️ Set default values to orderBy and order in teams, apps and deployments. PR [#390](https://github.com/fastapilabs/cloud/pull/390) by [@alejsdev](https://github.com/alejsdev).
* ♻️ Replace icons. PR [#385](https://github.com/fastapilabs/cloud/pull/385) by [@alejsdev](https://github.com/alejsdev).
* 💄 Add new colors and other tweaks. PR [#379](https://github.com/fastapilabs/cloud/pull/379) by [@alejsdev](https://github.com/alejsdev).
* 🚸 Add option to go back in email verification and email sent views. PR [#381](https://github.com/fastapilabs/cloud/pull/381) by [@alejsdev](https://github.com/alejsdev).
* 💄 Add new fonts. PR [#378](https://github.com/fastapilabs/cloud/pull/378) by [@alejsdev](https://github.com/alejsdev).
* 🔧 Update Dockerfiles to include ENV PYTHONUNBUFFERED=1. PR [#377](https://github.com/fastapilabs/cloud/pull/377) by [@tiangolo](https://github.com/tiangolo).
* ♻️ Use loader and query client together. PR [#364](https://github.com/fastapilabs/cloud/pull/364) by [@patrick91](https://github.com/patrick91).
* ♻️ Use modals for primary actions. PR [#313](https://github.com/fastapilabs/cloud/pull/313) by [@alejsdev](https://github.com/alejsdev).
* ♻️ Refactor UI in delete components. PR [#330](https://github.com/fastapilabs/cloud/pull/330) by [@alejsdev](https://github.com/alejsdev).
* ♻️ Refactor `generate-client.sh` to error out on failures and make settings use top level `.env`. PR [#343](https://github.com/fastapilabs/cloud/pull/343) by [@tiangolo](https://github.com/tiangolo).
* ♻️ Use official Python Docker image as base. PR [#312](https://github.com/fastapilabs/cloud/pull/312) by [@tiangolo](https://github.com/tiangolo).
* ♻️ Refactor prestart (migrations) into its own container. PR [#310](https://github.com/fastapilabs/cloud/pull/310) by [@tiangolo](https://github.com/tiangolo).
* ♻️ Include `FRONTEND_HOST` in CORS by default. PR [#309](https://github.com/fastapilabs/cloud/pull/309) by [@tiangolo](https://github.com/tiangolo).
* 🎨 Lint. PR [#315](https://github.com/fastapilabs/cloud/pull/315) by [@alejsdev](https://github.com/alejsdev).
* ♻️ Refactor apps URLs. PR [#289](https://github.com/fastapilabs/cloud/pull/289) by [@patrick91](https://github.com/patrick91).
* ♻️ Update logo, animated icons, and responsiveness tweaks. PR [#291](https://github.com/fastapilabs/cloud/pull/291) by [@alejsdev](https://github.com/alejsdev).
* 💄 Refactor auth views and add animations. PR [#280](https://github.com/fastapilabs/cloud/pull/280) by [@alejsdev](https://github.com/alejsdev).
* ♻️ Add app URL. PR [#285](https://github.com/fastapilabs/cloud/pull/285) by [@alejsdev](https://github.com/alejsdev).
* ♻️ Add `slug` and `created at` columns to distinguish apps with the same name. PR [#284](https://github.com/fastapilabs/cloud/pull/284) by [@alejsdev](https://github.com/alejsdev).
* ♻️ Refactor and simplify Docker Compose and update docs for it. PR [#277](https://github.com/fastapilabs/cloud/pull/277) by [@tiangolo](https://github.com/tiangolo).
* ♻️ Refactor is_allowed_recipient and `send_email` to show extra info about why a sender is not allowed (for logs). PR [#276](https://github.com/fastapilabs/cloud/pull/276) by [@tiangolo](https://github.com/tiangolo).
* ♻️ Refactor `DOMAIN` variable to `FRONTEND_HOST` and `API_HOST`. PR [#274](https://github.com/fastapilabs/cloud/pull/274) by [@tiangolo](https://github.com/tiangolo).
* ♻️ Add check to ensure we don't send actual emails to random accounts from development and staging. PR [#265](https://github.com/fastapilabs/cloud/pull/265) by [@tiangolo](https://github.com/tiangolo).
* 🔧 Increase rate limits for login api. PR [#263](https://github.com/fastapilabs/cloud/pull/263) by [@patrick91](https://github.com/patrick91).
* 💄 UI improvements and refactors. PR [#237](https://github.com/fastapilabs/cloud/pull/237) by [@alejsdev](https://github.com/alejsdev).
* ♻️ Refactor new invitation . PR [#244](https://github.com/fastapilabs/cloud/pull/244) by [@alejsdev](https://github.com/alejsdev).
* ♻️ Add EmptyState and Quickstart components. PR [#245](https://github.com/fastapilabs/cloud/pull/245) by [@alejsdev](https://github.com/alejsdev).
* ♻️ Add CustomCard component for reusable card layout . PR [#243](https://github.com/fastapilabs/cloud/pull/243) by [@alejsdev](https://github.com/alejsdev).
* 🔥 Remove unnecessary files. PR [#240](https://github.com/fastapilabs/cloud/pull/240) by [@alejsdev](https://github.com/alejsdev).
* ♻️ Refactor read apps endpoint. PR [#233](https://github.com/fastapilabs/cloud/pull/233) by [@alejsdev](https://github.com/alejsdev).
* ♻️ Update PostgreSQL URL generation to support Neon. PR [#223](https://github.com/fastapilabs/cloud/pull/223) by [@tiangolo](https://github.com/tiangolo).
* ♻️ Add status code 201 to create app endpoint. PR [#217](https://github.com/fastapilabs/cloud/pull/217) by [@alejsdev](https://github.com/alejsdev).
* 👷🏻 Auto-generate frontend client. PR [#215](https://github.com/fastapilabs/cloud/pull/215) by [@tiangolo](https://github.com/tiangolo).
* 🔧 Add necessary configs to allow running the tests in VS Code. PR [#203](https://github.com/fastapilabs/cloud/pull/203) by [@tiangolo](https://github.com/tiangolo).
* ♻️ Refactor Navbar. PR [#197](https://github.com/fastapilabs/cloud/pull/197) by [@alejsdev](https://github.com/alejsdev).
* ♻️ Refactor error handling. PR [#182](https://github.com/fastapilabs/cloud/pull/182) by [@alejsdev](https://github.com/alejsdev).
* 🎨 Lint and tweaks. PR [#180](https://github.com/fastapilabs/cloud/pull/180) by [@alejsdev](https://github.com/alejsdev).
* ♻️ Tweak frontend and add (temporary) image to empty state UI. PR [#173](https://github.com/fastapilabs/cloud/pull/173) by [@alejsdev](https://github.com/alejsdev).
* 🚨 Fix unused import. PR [#176](https://github.com/fastapilabs/cloud/pull/176) by [@patrick91](https://github.com/patrick91).
* ♻️ Close redis when request is done. PR [#165](https://github.com/fastapilabs/cloud/pull/165) by [@patrick91](https://github.com/patrick91).
* ♻️ Refactor Sidebar. PR [#169](https://github.com/fastapilabs/cloud/pull/169) by [@alejsdev](https://github.com/alejsdev).
* ♻️ Refactor models to use cascade delete relationships. PR [#167](https://github.com/fastapilabs/cloud/pull/167) by [@alejsdev](https://github.com/alejsdev).
* ♻️ Edit refactor models, routes and utils to use UUID instead of id integers. PR [#153](https://github.com/fastapilabs/cloud/pull/153) by [@estebanx64](https://github.com/estebanx64).
* ♻️ Reset password tests tweaks. PR [#154](https://github.com/fastapilabs/cloud/pull/154) by [@alejsdev](https://github.com/alejsdev).
* ♻️ Update filter in InvitationsTable and handle empty state. PR [#151](https://github.com/fastapilabs/cloud/pull/151) by [@alejsdev](https://github.com/alejsdev).
* 💚 Only run the backend service in tests. PR [#140](https://github.com/fastapilabs/cloud/pull/140) by [@patrick91](https://github.com/patrick91).
* 🔧 Add playwright-report to biome.json. PR [#136](https://github.com/fastapilabs/cloud/pull/136) by [@alejsdev](https://github.com/alejsdev).
* ♻️ Delete Account / Team. PR [#125](https://github.com/fastapilabs/cloud/pull/125) by [@alejsdev](https://github.com/alejsdev).
* ♻️ User settings refactor . PR [#124](https://github.com/fastapilabs/cloud/pull/124) by [@alejsdev](https://github.com/alejsdev).
* ♻️ Allow only admin roles to edit and delete teams, manage invitations and edit team name. PR [#113](https://github.com/fastapilabs/cloud/pull/113) by [@alejsdev](https://github.com/alejsdev).
* ♻️ Update `playwright.yml` for CI. PR [#101](https://github.com/fastapilabs/cloud/pull/101) by [@alejsdev](https://github.com/alejsdev).
* 🎨 Lint . PR [#106](https://github.com/fastapilabs/cloud/pull/106) by [@alejsdev](https://github.com/alejsdev).
* ♻️ Update team-slug in Team. PR [#103](https://github.com/fastapilabs/cloud/pull/103) by [@alejsdev](https://github.com/alejsdev).
* ♻️ Use team slug instead of team id. PR [#95](https://github.com/fastapilabs/cloud/pull/95) by [@patrick91](https://github.com/patrick91).
* ✨ Return and use user info on login. PR [#93](https://github.com/fastapilabs/cloud/pull/93) by [@patrick91](https://github.com/patrick91).
* ✨ Introduce a version of UserPublic for /me. PR [#89](https://github.com/fastapilabs/cloud/pull/89) by [@patrick91](https://github.com/patrick91).
* ✏️ Edit maxWidth. PR [#92](https://github.com/fastapilabs/cloud/pull/92) by [@alejsdev](https://github.com/alejsdev).
* ⚒️ Frontend tweaks. PR [#91](https://github.com/fastapilabs/cloud/pull/91) by [@alejsdev](https://github.com/alejsdev).
* 🗃 Edit set varchar to 255 in User, UserTeamLink, Team and invitation models. PR [#87](https://github.com/fastapilabs/cloud/pull/87) by [@estebanx64](https://github.com/estebanx64).
* ♻️ Regenerate client with latest changes . PR [#82](https://github.com/fastapilabs/cloud/pull/82) by [@alejsdev](https://github.com/alejsdev).
* 🔧 Ignore .env files in backend. PR [#80](https://github.com/fastapilabs/cloud/pull/80) by [@patrick91](https://github.com/patrick91).
* 🔧 Reuse database url from config in alembic setup. PR [#81](https://github.com/fastapilabs/cloud/pull/81) by [@patrick91](https://github.com/patrick91).
* ♻️ Update teams in UserMenu component. PR [#78](https://github.com/fastapilabs/cloud/pull/78) by [@alejsdev](https://github.com/alejsdev).
* ♻️ Regenerate client with latest changes. PR [#76](https://github.com/fastapilabs/cloud/pull/76) by [@alejsdev](https://github.com/alejsdev).
* ✨ Refactor team slug services. PR [#74](https://github.com/fastapilabs/cloud/pull/74) by [@estebanx64](https://github.com/estebanx64).
* 🔥 Remove unnecessary invited_user_id logic. PR [#72](https://github.com/fastapilabs/cloud/pull/72) by [@estebanx64](https://github.com/estebanx64).
* ✏️ Update toast message for successful invitation sending. PR [#70](https://github.com/fastapilabs/cloud/pull/70) by [@alejsdev](https://github.com/alejsdev).
* ✏️ Update favicon path. PR [#69](https://github.com/fastapilabs/cloud/pull/69) by [@alejsdev](https://github.com/alejsdev).
* 🚚 Move assets to public folder. PR [#65](https://github.com/fastapilabs/cloud/pull/65) by [@alejsdev](https://github.com/alejsdev).
* 🎨 Tweaks style related for consistency . PR [#63](https://github.com/fastapilabs/cloud/pull/63) by [@alejsdev](https://github.com/alejsdev).
* ✅ Update conftest.py to remove DB data even after test errors. PR [#62](https://github.com/fastapilabs/cloud/pull/62) by [@alejsdev](https://github.com/alejsdev).
* ♻️ Refactor invitations creation to only accept an email and not an ID to simplify logic. PR [#61](https://github.com/fastapilabs/cloud/pull/61) by [@alejsdev](https://github.com/alejsdev).
* ♻️ Add API endpoint for invitation HTML content and update email template. PR [#59](https://github.com/fastapilabs/cloud/pull/59) by [@alejsdev](https://github.com/alejsdev).
* ♻️ Regenerate frontend client. PR [#58](https://github.com/fastapilabs/cloud/pull/58) by [@alejsdev](https://github.com/alejsdev).
* ♻️ Refactor migrate from python-jose to PyJWT. PR [#54](https://github.com/fastapilabs/cloud/pull/54) by [@estebanx64](https://github.com/estebanx64).
* ♻️ Update email templates. PR [#51](https://github.com/fastapilabs/cloud/pull/51) by [@alejsdev](https://github.com/alejsdev).
* ♻️ Refactor auth token to new sub format user-{user-id}. PR [#48](https://github.com/fastapilabs/cloud/pull/48) by [@estebanx64](https://github.com/estebanx64).
* ♻️ Regenerate frontend client, disable Items and remove superuser logic. PR [#49](https://github.com/fastapilabs/cloud/pull/49) by [@alejsdev](https://github.com/alejsdev).
* ✅ Update test to add verification database records. PR [#43](https://github.com/fastapilabs/cloud/pull/43) by [@estebanx64](https://github.com/estebanx64).
* ✨ Regenerate frontend client and rename "Organizations" to "Teams". PR [#36](https://github.com/fastapilabs/cloud/pull/36) by [@alejsdev](https://github.com/alejsdev).
* ♻️ Rename org path params to teams. PR [#37](https://github.com/fastapilabs/cloud/pull/37) by [@estebanx64](https://github.com/estebanx64).
* ✨ View, edit and remove users in organizations. PR [#28](https://github.com/fastapilabs/cloud/pull/28) by [@alejsdev](https://github.com/alejsdev).
* 🚚 Rename organization resources to team. PR [#32](https://github.com/fastapilabs/cloud/pull/32) by [@estebanx64](https://github.com/estebanx64).
* ✨ Add useCurrentUser hook with suspense. PR [#34](https://github.com/fastapilabs/cloud/pull/34) by [@patrick91](https://github.com/patrick91).
* ♻️ Update organization test. PR [#30](https://github.com/fastapilabs/cloud/pull/30) by [@alejsdev](https://github.com/alejsdev).
* ♻️ Regenerate frontend client. PR [#24](https://github.com/fastapilabs/cloud/pull/24) by [@alejsdev](https://github.com/alejsdev).
* ♻️ Rename routes and tests for consistency. PR [#23](https://github.com/fastapilabs/cloud/pull/23) by [@alejsdev](https://github.com/alejsdev).
* ♻️ Upgrade . PR [#22](https://github.com/fastapilabs/cloud/pull/22) by [@alejsdev](https://github.com/alejsdev).
* ♻️ Regenerate frontend client. PR [#21](https://github.com/fastapilabs/cloud/pull/21) by [@alejsdev](https://github.com/alejsdev).
* ♻️ Upgrade from Upstream. PR [#19](https://github.com/fastapilabs/cloud/pull/19) by [@alejsdev](https://github.com/alejsdev).
* ✨ Restructure UserMenu and Sidebar. PR [#17](https://github.com/fastapilabs/cloud/pull/17) by [@alejsdev](https://github.com/alejsdev).
* ♻️  Upgrade from full-stack-fastapi-template. PR [#18](https://github.com/fastapilabs/cloud/pull/18) by [@alejsdev](https://github.com/alejsdev).
* ♻️ Upgrade from upstream. PR [#13](https://github.com/fastapilabs/cloud/pull/13) by [@alejsdev](https://github.com/alejsdev).
* 🥅 Set up Sentry for FastAPI applications. PR [#11](https://github.com/fastapilabs/cloud/pull/11) by [@estebanx64](https://github.com/estebanx64).
* ♻️ Sign Up refactor. PR [#12](https://github.com/fastapilabs/cloud/pull/12) by [@alejsdev](https://github.com/alejsdev).
* ♻️ Regenerate frontend client. PR [#1156](https://github.com/tiangolo/full-stack-fastapi-template/pull/1156) by [@alejsdev](https://github.com/alejsdev).
* ♻️ Refactor rename ModelsOut to ModelsPublic. PR [#1154](https://github.com/tiangolo/full-stack-fastapi-template/pull/1154) by [@estebanx64](https://github.com/estebanx64).
* ♻️ Migrate frontend client generation from `openapi-typescript-codegen` to `@hey-api/openapi-ts`. PR [#1151](https://github.com/tiangolo/full-stack-fastapi-template/pull/1151) by [@alejsdev](https://github.com/alejsdev).
* 🔥 Remove unused exports and update dependencies. PR [#1146](https://github.com/tiangolo/full-stack-fastapi-template/pull/1146) by [@alejsdev](https://github.com/alejsdev).
* 🔧 Update sentry dns initialization following the environment settings. PR [#1145](https://github.com/tiangolo/full-stack-fastapi-template/pull/1145) by [@estebanx64](https://github.com/estebanx64).
* ♻️ Refactor and tweaks, rename `UserCreateOpen` to `UserRegister` and others. PR [#1143](https://github.com/tiangolo/full-stack-fastapi-template/pull/1143) by [@alejsdev](https://github.com/alejsdev).
* 🎨 Format imports. PR [#1140](https://github.com/tiangolo/full-stack-fastapi-template/pull/1140) by [@alejsdev](https://github.com/alejsdev).
* ♻️ Refactor and remove `React.FC`. PR [#1139](https://github.com/tiangolo/full-stack-fastapi-template/pull/1139) by [@alejsdev](https://github.com/alejsdev).
* ♻️ Add email pattern and refactor in frontend. PR [#1138](https://github.com/tiangolo/full-stack-fastapi-template/pull/1138) by [@alejsdev](https://github.com/alejsdev).
* 🥅 Set up Sentry for FastAPI applications. PR [#1136](https://github.com/tiangolo/full-stack-fastapi-template/pull/1136) by [@estebanx64](https://github.com/estebanx64).
* 🔥 Remove deprecated Docker Compose version key. PR [#1129](https://github.com/tiangolo/full-stack-fastapi-template/pull/1129) by [@tiangolo](https://github.com/tiangolo).
* 🎨 Format with Biome . PR [#1097](https://github.com/tiangolo/full-stack-fastapi-template/pull/1097) by [@alejsdev](https://github.com/alejsdev).
* 🎨 Update quote style in biome formatter. PR [#1095](https://github.com/tiangolo/full-stack-fastapi-template/pull/1095) by [@alejsdev](https://github.com/alejsdev).
* ♻️ Replace ESLint and Prettier with Biome to format and lint frontend. PR [#719](https://github.com/tiangolo/full-stack-fastapi-template/pull/719) by [@santigandolfo](https://github.com/santigandolfo).
* 🎨 Replace buttons styling for variants for consistency. PR [#722](https://github.com/tiangolo/full-stack-fastapi-template/pull/722) by [@alejsdev](https://github.com/alejsdev).
* 🛠️ Improve `modify-openapi-operationids.js`. PR [#720](https://github.com/tiangolo/full-stack-fastapi-template/pull/720) by [@alejsdev](https://github.com/alejsdev).
* ♻️ Replace pytest-mock with unittest.mock and remove pytest-cov. PR [#717](https://github.com/tiangolo/full-stack-fastapi-template/pull/717) by [@estebanx64](https://github.com/estebanx64).
* 🛠️ Minor changes in frontend. PR [#715](https://github.com/tiangolo/full-stack-fastapi-template/pull/715) by [@alejsdev](https://github.com/alejsdev).
* ♻ Update Docker image to prevent errors in M1 Macs. PR [#710](https://github.com/tiangolo/full-stack-fastapi-template/pull/710) by [@dudil](https://github.com/dudil).
* ✏ Fix typo in variable names in `backend/app/api/routes/items.py` and `backend/app/api/routes/users.py`. PR [#711](https://github.com/tiangolo/full-stack-fastapi-template/pull/711) by [@disrupted](https://github.com/disrupted).

### Upgrades

* ⬆️ Upgrade @tanstack/react-query-devtools to latest version and add ReactQueryDevTools to the root route. PR [#728](https://github.com/fastapilabs/cloud/pull/728) by [@alejsdev](https://github.com/alejsdev).
* ⬆️ Update `package-lock.json`. PR [#685](https://github.com/fastapilabs/cloud/pull/685) by [@alejsdev](https://github.com/alejsdev).
* ⬆️ Upgrade tanstack/react-router. PR [#680](https://github.com/fastapilabs/cloud/pull/680) by [@alejsdev](https://github.com/alejsdev).
* 📌 Update uv.lock. PR [#652](https://github.com/fastapilabs/cloud/pull/652) by [@tiangolo](https://github.com/tiangolo).
* ⬆️ Upgrade Python to 3.13. PR [#648](https://github.com/fastapilabs/cloud/pull/648) by [@tiangolo](https://github.com/tiangolo).
* ⬆️ Upgrade FastAPI version. PR [#311](https://github.com/fastapilabs/cloud/pull/311) by [@tiangolo](https://github.com/tiangolo).
* ⬆️ Upgrade SQLModel. PR [#157](https://github.com/fastapilabs/cloud/pull/157) by [@tiangolo](https://github.com/tiangolo).
* ♻️ Update Traefik. PR [#119](https://github.com/fastapilabs/cloud/pull/119) by [@tiangolo](https://github.com/tiangolo).
* ⬆️ Upgrade SQLModel. PR [#56](https://github.com/fastapilabs/cloud/pull/56) by [@tiangolo](https://github.com/tiangolo).
* Bump follow-redirects from 1.15.5 to 1.15.6 in /frontend. PR [#734](https://github.com/tiangolo/full-stack-fastapi-template/pull/734) by [@dependabot[bot]](https://github.com/apps/dependabot).

### Infrastructure

* 🔧 Update latest-changes config to include infra section. PR [#645](https://github.com/fastapilabs/cloud/pull/645) by [@tiangolo](https://github.com/tiangolo).

### Docs

* 📝 Tweak READMEs for new uv workspaces setup. PR [#729](https://github.com/fastapilabs/cloud/pull/729) by [@tiangolo](https://github.com/tiangolo).
* 📝 Update README for infra deployment, include deploying all cloud backend parts, clarify instructions. PR [#688](https://github.com/fastapilabs/cloud/pull/688) by [@tiangolo](https://github.com/tiangolo).
* 📝 Update `frontend/README.md`. PR [#660](https://github.com/fastapilabs/cloud/pull/660) by [@alejsdev](https://github.com/alejsdev).
* 📝 Update README format. PR [#643](https://github.com/fastapilabs/cloud/pull/643) by [@tiangolo](https://github.com/tiangolo).
* 🍱 Update architecture diagram. PR [#635](https://github.com/fastapilabs/cloud/pull/635) by [@tiangolo](https://github.com/tiangolo).
* 📝 Tweak infra README. PR [#516](https://github.com/fastapilabs/cloud/pull/516) by [@tiangolo](https://github.com/tiangolo).
* ♻️ Refactor Kubernetes deployment, do not deploy from Pulumi. PR [#515](https://github.com/fastapilabs/cloud/pull/515) by [@tiangolo](https://github.com/tiangolo).
* 🔒️ Migrate TLS and domain handling, use Cloudflare, support customer domains in cluster/cloud. PR [#485](https://github.com/fastapilabs/cloud/pull/485) by [@tiangolo](https://github.com/tiangolo).
* 📝 Update docs for Cloudflare pages CI in a new environment. PR [#452](https://github.com/fastapilabs/cloud/pull/452) by [@tiangolo](https://github.com/tiangolo).
* 📝 Update docs for deploying and production config. PR [#449](https://github.com/fastapilabs/cloud/pull/449) by [@tiangolo](https://github.com/tiangolo).
* 📝 Update infra README after several iterations of cluster destroy/create. PR [#447](https://github.com/fastapilabs/cloud/pull/447) by [@tiangolo](https://github.com/tiangolo).
* 📝 Update docs for Docker Compose watch. PR [#405](https://github.com/fastapilabs/cloud/pull/405) by [@tiangolo](https://github.com/tiangolo).
* 📝 Update infra README. PR [#386](https://github.com/fastapilabs/cloud/pull/386) by [@tiangolo](https://github.com/tiangolo).
* 📝 Add infra diagram. PR [#370](https://github.com/fastapilabs/cloud/pull/370) by [@tiangolo](https://github.com/tiangolo).
* 📝 Update docs about creating a new environment to deploy. PR [#361](https://github.com/fastapilabs/cloud/pull/361) by [@tiangolo](https://github.com/tiangolo).
* 📝 Update README about scripts location. PR [#326](https://github.com/fastapilabs/cloud/pull/326) by [@tiangolo](https://github.com/tiangolo).
* 📝 Update instructions to clone for a private repo, including updates. PR [#1127](https://github.com/tiangolo/full-stack-fastapi-template/pull/1127) by [@tiangolo](https://github.com/tiangolo).
* 📝 Add docs about CI keys, LATEST_CHANGES and SMOKESHOW_AUTH_KEY. PR [#1126](https://github.com/tiangolo/full-stack-fastapi-template/pull/1126) by [@tiangolo](https://github.com/tiangolo).
* ✏️ Fix file path in `backend/README.md` when not wanting to use migrations. PR [#1116](https://github.com/tiangolo/full-stack-fastapi-template/pull/1116) by [@leonlowitzki](https://github.com/leonlowitzki).
* 📝 Add documentation for pre-commit and code linting. PR [#718](https://github.com/tiangolo/full-stack-fastapi-template/pull/718) by [@estebanx64](https://github.com/estebanx64).
* 📝 Fix localhost URLs in `development.md`. PR [#1099](https://github.com/tiangolo/full-stack-fastapi-template/pull/1099) by [@efonte](https://github.com/efonte).
* ✏ Update header titles for consistency. PR [#708](https://github.com/tiangolo/full-stack-fastapi-template/pull/708) by [@codesmith-emmy](https://github.com/codesmith-emmy).
* 📝 Update `README.md`, dark mode screenshot position. PR [#706](https://github.com/tiangolo/full-stack-fastapi-template/pull/706) by [@alejsdev](https://github.com/alejsdev).

### Internal

* 🔧 Update Dependabot config. PR [#784](https://github.com/fastapilabs/cloud/pull/784) by [@alejsdev](https://github.com/alejsdev).
* ⬆ Bump astral-sh/setup-uv from 5 to 6. PR [#777](https://github.com/fastapilabs/cloud/pull/777) by [@dependabot[bot]](https://github.com/apps/dependabot).
* 🔧 Add configuration for running python tests in vscode (and forks). PR [#736](https://github.com/fastapilabs/cloud/pull/736) by [@patrick91](https://github.com/patrick91).
* ➕ Add `external-secrets` to kubernetes cluster. PR [#733](https://github.com/fastapilabs/cloud/pull/733) by [@siryur](https://github.com/siryur).
* 👷 Run tests/deploy/lint when packages change too. PR [#735](https://github.com/fastapilabs/cloud/pull/735) by [@patrick91](https://github.com/patrick91).
* 👷 Fix CI for uv workspaces and internal subpackages. PR [#734](https://github.com/fastapilabs/cloud/pull/734) by [@tiangolo](https://github.com/tiangolo).
* ➕ Add `duck`. PR [#726](https://github.com/fastapilabs/cloud/pull/726) by [@patrick91](https://github.com/patrick91).
* 🧑‍💻 Implement uv workspaces. PR [#692](https://github.com/fastapilabs/cloud/pull/692) by [@patrick91](https://github.com/patrick91).
* 🧑‍💻 Move backend code inside `/app/backend` in docker. PR [#691](https://github.com/fastapilabs/cloud/pull/691) by [@patrick91](https://github.com/patrick91).
* 🧑‍💻 Add symlink to biome.json in root folder. PR [#690](https://github.com/fastapilabs/cloud/pull/690) by [@patrick91](https://github.com/patrick91).
* 🔧 Add npm and docker package ecosystems to Dependabot configuration. PR [#683](https://github.com/fastapilabs/cloud/pull/683) by [@alejsdev](https://github.com/alejsdev).
* 🔧 Set Node version to 20 in the local .nvmrc file. PR [#682](https://github.com/fastapilabs/cloud/pull/682) by [@tiangolo](https://github.com/tiangolo).
* 🍱 Update architecture diagram to have white background, for dark mode GitHub. PR [#681](https://github.com/fastapilabs/cloud/pull/681) by [@tiangolo](https://github.com/tiangolo).
* 🩹 Prevent nats from endlessing trying to reconnect. PR [#661](https://github.com/fastapilabs/cloud/pull/661) by [@patrick91](https://github.com/patrick91).
* 🐛 Fix domain for dev API. PR [#655](https://github.com/fastapilabs/cloud/pull/655) by [@tiangolo](https://github.com/tiangolo).
* 🐛 Fix JSON config in latest-changes. PR [#646](https://github.com/fastapilabs/cloud/pull/646) by [@tiangolo](https://github.com/tiangolo).
* 🚀 Deploy to prod on merge to master. PR [#644](https://github.com/fastapilabs/cloud/pull/644) by [@tiangolo](https://github.com/tiangolo).
* ♻️ Move logic to check if user can signup to Waitlist model. PR [#609](https://github.com/fastapilabs/cloud/pull/609) by [@patrick91](https://github.com/patrick91).
* ✨ Improve server events for Posthog. PR [#638](https://github.com/fastapilabs/cloud/pull/638) by [@patrick91](https://github.com/patrick91).
* ✨ Add Posthog. PR [#631](https://github.com/fastapilabs/cloud/pull/631) by [@patrick91](https://github.com/patrick91).
* ♻️ Remove old Redis types. PR [#629](https://github.com/fastapilabs/cloud/pull/629) by [@patrick91](https://github.com/patrick91).
* ⬆️  Upgrade dependencies. PR [#627](https://github.com/fastapilabs/cloud/pull/627) by [@patrick91](https://github.com/patrick91).
* 🔥 Remove `query_pending_users_to_send_invitation`. PR [#616](https://github.com/fastapilabs/cloud/pull/616) by [@patrick91](https://github.com/patrick91).
* 📝 Add CLI deployment instructions and environment configuration script. PR [#614](https://github.com/fastapilabs/cloud/pull/614) by [@alejsdev](https://github.com/alejsdev).
* ♻️ Disable email check when not in production. PR [#606](https://github.com/fastapilabs/cloud/pull/606) by [@patrick91](https://github.com/patrick91).
* ♻️  Move email check to utils. PR [#605](https://github.com/fastapilabs/cloud/pull/605) by [@patrick91](https://github.com/patrick91).
* 👷 Add logs collection with Vector, sending to NATS. PR [#581](https://github.com/fastapilabs/cloud/pull/581) by [@tiangolo](https://github.com/tiangolo).
* ⬆️ Upgrade biomejs to latest. PR [#608](https://github.com/fastapilabs/cloud/pull/608) by [@patrick91](https://github.com/patrick91).
* 🚨 Run pre-commit on all files. PR [#600](https://github.com/fastapilabs/cloud/pull/600) by [@patrick91](https://github.com/patrick91).
* 💚 Add biome to pre-commit-config. PR [#599](https://github.com/fastapilabs/cloud/pull/599) by [@patrick91](https://github.com/patrick91).
* ✨ Add retry on create build on depot. PR [#576](https://github.com/fastapilabs/cloud/pull/576) by [@patrick91](https://github.com/patrick91).
* 👷 Add NATS env vars to Kubernetes manifests. PR [#590](https://github.com/fastapilabs/cloud/pull/590) by [@tiangolo](https://github.com/tiangolo).
* 👷 Fix messenger sending Sentry events. PR [#589](https://github.com/fastapilabs/cloud/pull/589) by [@tiangolo](https://github.com/tiangolo).
* 👷 Add Redis config to messenger Kubernetes manifest. PR [#588](https://github.com/fastapilabs/cloud/pull/588) by [@tiangolo](https://github.com/tiangolo).
* 👷 Add Redis deployment env vars in CI. PR [#584](https://github.com/fastapilabs/cloud/pull/584) by [@tiangolo](https://github.com/tiangolo).
* 👷 Add NATS hostname env vars to deployments. PR [#583](https://github.com/fastapilabs/cloud/pull/583) by [@tiangolo](https://github.com/tiangolo).
* 🔥 Remove deprecated code. PR [#577](https://github.com/fastapilabs/cloud/pull/577) by [@patrick91](https://github.com/patrick91).
* 🥅 Send message to sentry when messenger message is wrong. PR [#573](https://github.com/fastapilabs/cloud/pull/573) by [@patrick91](https://github.com/patrick91).
* ✨ Add retries in messenger. PR [#572](https://github.com/fastapilabs/cloud/pull/572) by [@patrick91](https://github.com/patrick91).
* ✅ Add test for messenger's main function. PR [#571](https://github.com/fastapilabs/cloud/pull/571) by [@patrick91](https://github.com/patrick91).
* ⬆️ Update Dockerfile to use uv version 0.5.11. PR [#569](https://github.com/fastapilabs/cloud/pull/569) by [@alejsdev](https://github.com/alejsdev).
* ✅ Add tests for process message. PR [#570](https://github.com/fastapilabs/cloud/pull/570) by [@patrick91](https://github.com/patrick91).
* ⬆ Bump astral-sh/setup-uv from 4 to 5. PR [#564](https://github.com/fastapilabs/cloud/pull/564) by [@dependabot[bot]](https://github.com/apps/dependabot).
* ♻️ Rename `AWS_SQS_BUILDER_QUEUE_NAME` to `BUILDER_QUEUE_NAME`. PR [#559](https://github.com/fastapilabs/cloud/pull/559) by [@patrick91](https://github.com/patrick91).
* ♻️ Rename `AWS_DEPLOYMENT_BUCKET` to `DEPLOYMENTS_BUCKET_NAME`. PR [#558](https://github.com/fastapilabs/cloud/pull/558) by [@patrick91](https://github.com/patrick91).
* ♻️ Add `BACKEND_` prefix to `SENTRY_DSN` environment variable. PR [#557](https://github.com/fastapilabs/cloud/pull/557) by [@patrick91](https://github.com/patrick91).
* ✨ Add Sentry to frontend. PR [#555](https://github.com/fastapilabs/cloud/pull/555) by [@patrick91](https://github.com/patrick91).
* ♻️ Remove unused code. PR [#546](https://github.com/fastapilabs/cloud/pull/546) by [@patrick91](https://github.com/patrick91).
* 🔨 Update script to set vars in GitHub And Cloudflare, pin dependencies. PR [#536](https://github.com/fastapilabs/cloud/pull/536) by [@tiangolo](https://github.com/tiangolo).
* ⬆ Update httpx requirement from <0.28.0,>=0.27.0 to >=0.27.0,<0.29.0. PR [#535](https://github.com/fastapilabs/cloud/pull/535) by [@dependabot[bot]](https://github.com/apps/dependabot).
* ⬆ Bump astral-sh/setup-uv from 3 to 4. PR [#525](https://github.com/fastapilabs/cloud/pull/525) by [@dependabot[bot]](https://github.com/apps/dependabot).
* ✨ Update openapi-ts. PR [#526](https://github.com/fastapilabs/cloud/pull/526) by [@patrick91](https://github.com/patrick91).
* 🔧 Upgrade pre-commit. PR [#513](https://github.com/fastapilabs/cloud/pull/513) by [@tiangolo](https://github.com/tiangolo).
* ♻️ Move our own apps to our own Kubernetes namespace `fastapicloud`. PR [#500](https://github.com/fastapilabs/cloud/pull/500) by [@estebanx64](https://github.com/estebanx64).
* 👷 Add Cloudflare env vars to deployments, will be used for domains. PR [#506](https://github.com/fastapilabs/cloud/pull/506) by [@tiangolo](https://github.com/tiangolo).
* ✨ Add new depot deploy service in both api & builder and refactor builder utils. PR [#491](https://github.com/fastapilabs/cloud/pull/491) by [@estebanx64](https://github.com/estebanx64).
* ⬆ Bump tiangolo/latest-changes from 0.3.1 to 0.3.2. PR [#494](https://github.com/fastapilabs/cloud/pull/494) by [@dependabot[bot]](https://github.com/apps/dependabot).
* 💚 Replace base playwright image. PR [#493](https://github.com/fastapilabs/cloud/pull/493) by [@patrick91](https://github.com/patrick91).
* 💚 Use private API to create teams. PR [#490](https://github.com/fastapilabs/cloud/pull/490) by [@patrick91](https://github.com/patrick91).
* 💚 Use private API to create users. PR [#488](https://github.com/fastapilabs/cloud/pull/488) by [@patrick91](https://github.com/patrick91).
* 👔 All team slugs should have a suffix. PR [#479](https://github.com/fastapilabs/cloud/pull/479) by [@estebanx64](https://github.com/estebanx64).
* 👔 Add app name reserved suffix keywords. PR [#478](https://github.com/fastapilabs/cloud/pull/478) by [@estebanx64](https://github.com/estebanx64).
* 🚸 Fix device authorization box in dark mode. PR [#481](https://github.com/fastapilabs/cloud/pull/481) by [@patrick91](https://github.com/patrick91).
* 🔥 Remove Pulumi to set up an instance in where to install a GitHub Actions Runner and its docs. PR [#487](https://github.com/fastapilabs/cloud/pull/487) by [@tiangolo](https://github.com/tiangolo).
* 🚀 Deploy our backend from Depot runners instead of custom GitHub runners. PR [#486](https://github.com/fastapilabs/cloud/pull/486) by [@tiangolo](https://github.com/tiangolo).
* ✨ Add initial namespace per team logic in builder. PR [#440](https://github.com/fastapilabs/cloud/pull/440) by [@estebanx64](https://github.com/estebanx64).
* 👷 Update Playwright CI and Docker Compose to use depends on backend and mailcatcher. PR [#468](https://github.com/fastapilabs/cloud/pull/468) by [@tiangolo](https://github.com/tiangolo).
* 👷 Run Playwright on Docker for performance. PR [#466](https://github.com/fastapilabs/cloud/pull/466) by [@tiangolo](https://github.com/tiangolo).
* 👷 Use Depot to build the Docker Compose images. PR [#463](https://github.com/fastapilabs/cloud/pull/463) by [@tiangolo](https://github.com/tiangolo).
* 👷 Use Depot for GitHub Actions runners. PR [#462](https://github.com/fastapilabs/cloud/pull/462) by [@tiangolo](https://github.com/tiangolo).
* ♻️ Enable private API based on environment, not dedicated env var. PR [#458](https://github.com/fastapilabs/cloud/pull/458) by [@tiangolo](https://github.com/tiangolo).
* 👷 Update Smokeshow command. PR [#459](https://github.com/fastapilabs/cloud/pull/459) by [@tiangolo](https://github.com/tiangolo).
* ⬆ Update pulumi-eks requirement from <3.0.0,>=2.0.0 to >=2.0.0,<4.0.0. PR [#446](https://github.com/fastapilabs/cloud/pull/446) by [@dependabot[bot]](https://github.com/apps/dependabot).
* 👷 Update Smokeshow CI, read contents. PR [#456](https://github.com/fastapilabs/cloud/pull/456) by [@tiangolo](https://github.com/tiangolo).
* 👷 Add notification when Smokeshow ends. PR [#455](https://github.com/fastapilabs/cloud/pull/455) by [@tiangolo](https://github.com/tiangolo).
* 👷 Run Smokeshow coverage only if coverage files available. PR [#454](https://github.com/fastapilabs/cloud/pull/454) by [@tiangolo](https://github.com/tiangolo).
* 👷 Tweak each CI workflow to run conditionally on its own file changes. PR [#453](https://github.com/fastapilabs/cloud/pull/453) by [@tiangolo](https://github.com/tiangolo).
* 👷 Update CI to allow deploying to prod. PR [#450](https://github.com/fastapilabs/cloud/pull/450) by [@tiangolo](https://github.com/tiangolo).
* 👷 Fix GitHub Runner disk on same instance. PR [#443](https://github.com/fastapilabs/cloud/pull/443) by [@tiangolo](https://github.com/tiangolo).
* 🔧 Update Dockefiles to use non-root user. PR [#442](https://github.com/fastapilabs/cloud/pull/442) by [@tiangolo](https://github.com/tiangolo).
* 🧱 Add knative security context by default kustomization patch. PR [#426](https://github.com/fastapilabs/cloud/pull/426) by [@estebanx64](https://github.com/estebanx64).
* 👷 Update GitHub Runner image. PR [#433](https://github.com/fastapilabs/cloud/pull/433) by [@tiangolo](https://github.com/tiangolo).
* 👷 Remove unneeded variable for Docker in Docker. PR [#431](https://github.com/fastapilabs/cloud/pull/431) by [@tiangolo](https://github.com/tiangolo).
* 🔧 Update builder manifest config file, remove no longer used config map and secrets. PR [#430](https://github.com/fastapilabs/cloud/pull/430) by [@tiangolo](https://github.com/tiangolo).
* ♻️ Update creation of ECR repos for TriggerMesh. PR [#429](https://github.com/fastapilabs/cloud/pull/429) by [@tiangolo](https://github.com/tiangolo).
* 🚚 Move infra files for consistency and hierarchy. PR [#424](https://github.com/fastapilabs/cloud/pull/424) by [@tiangolo](https://github.com/tiangolo).
* 🔥 Remove unused TriggerMesh AWS Redis. PR [#423](https://github.com/fastapilabs/cloud/pull/423) by [@tiangolo](https://github.com/tiangolo).
* 🔧 Update TriggerMesh Kubernetes manifests to use env vars, automatize in script, update docs. PR [#422](https://github.com/fastapilabs/cloud/pull/422) by [@tiangolo](https://github.com/tiangolo).
* 🔧 Remove unused env var in builder and its CI. PR [#420](https://github.com/fastapilabs/cloud/pull/420) by [@tiangolo](https://github.com/tiangolo).
* 👷 Deploy the builder using envsubst to keep consistency and simplify setup. PR [#419](https://github.com/fastapilabs/cloud/pull/419) by [@tiangolo](https://github.com/tiangolo).
* 👷 Fix builder Dockerfile. PR [#417](https://github.com/fastapilabs/cloud/pull/417) by [@tiangolo](https://github.com/tiangolo).
* 👷 Refactor Kubernetes deployment scripts to make them independent of a GitHub Runner. PR [#413](https://github.com/fastapilabs/cloud/pull/413) by [@tiangolo](https://github.com/tiangolo).
* 👷 Fix image tag for builder. PR [#415](https://github.com/fastapilabs/cloud/pull/415) by [@tiangolo](https://github.com/tiangolo).
* 👷 Fix image for builder in CI. PR [#414](https://github.com/fastapilabs/cloud/pull/414) by [@tiangolo](https://github.com/tiangolo).
* 👷 Update CI for frontend in development. PR [#412](https://github.com/fastapilabs/cloud/pull/412) by [@tiangolo](https://github.com/tiangolo).
* 👷 Add support for deploying the builder in a workflow_dispatch. PR [#410](https://github.com/fastapilabs/cloud/pull/410) by [@tiangolo](https://github.com/tiangolo).
* 👷 Update computing value for workflow dispatch in deploy backend workflow. PR [#409](https://github.com/fastapilabs/cloud/pull/409) by [@tiangolo](https://github.com/tiangolo).
* ⏪️ Revert default environments in an env var, GitHub Actions can't seem to handle it. PR [#408](https://github.com/fastapilabs/cloud/pull/408) by [@tiangolo](https://github.com/tiangolo).
* 👷 Set environments JSON string in env var to make it easier to update. PR [#407](https://github.com/fastapilabs/cloud/pull/407) by [@tiangolo](https://github.com/tiangolo).
* 👷 Add support for deploying backend on workflow_dispatch. PR [#406](https://github.com/fastapilabs/cloud/pull/406) by [@tiangolo](https://github.com/tiangolo).
* 👷 Deploy builder to staging and development on CI. PR [#404](https://github.com/fastapilabs/cloud/pull/404) by [@tiangolo](https://github.com/tiangolo).
* 🧱 Add infrastructure templates and update README about infra. PR [#401](https://github.com/fastapilabs/cloud/pull/401) by [@estebanx64](https://github.com/estebanx64).
* 👷 Don't override labels added by hand. PR [#403](https://github.com/fastapilabs/cloud/pull/403) by [@tiangolo](https://github.com/tiangolo).
* 🔧 Add `DEPLOYMENTS_DOMAIN` env var to CI and `.env`. PR [#399](https://github.com/fastapilabs/cloud/pull/399) by [@tiangolo](https://github.com/tiangolo).
* 👷 Tweak Cloudflare action to deploy to prod. PR [#398](https://github.com/fastapilabs/cloud/pull/398) by [@tiangolo](https://github.com/tiangolo).
* 🔥 Remove unused config and env vars for USERS_OPEN_REGISTRATION. PR [#397](https://github.com/fastapilabs/cloud/pull/397) by [@tiangolo](https://github.com/tiangolo).
* 👷 Deploy Pulumi using GitHub environments. PR [#396](https://github.com/fastapilabs/cloud/pull/396) by [@tiangolo](https://github.com/tiangolo).
* 👷 Deploy backend to staging and development environments. PR [#395](https://github.com/fastapilabs/cloud/pull/395) by [@tiangolo](https://github.com/tiangolo).
* 👷 Rename Pulumi workflows to clarify their scope. PR [#394](https://github.com/fastapilabs/cloud/pull/394) by [@tiangolo](https://github.com/tiangolo).
* 👷 Add CI for frontend in development environment (after setting up secrets and vars). PR [#392](https://github.com/fastapilabs/cloud/pull/392) by [@tiangolo](https://github.com/tiangolo).
* ✨ Add private API for environment variables. PR [#391](https://github.com/fastapilabs/cloud/pull/391) by [@patrick91](https://github.com/patrick91).
* ✨ Add support for env vars in builder. PR [#388](https://github.com/fastapilabs/cloud/pull/388) by [@estebanx64](https://github.com/estebanx64).
* ♻️ Set Sentry environment from config. PR [#389](https://github.com/fastapilabs/cloud/pull/389) by [@tiangolo](https://github.com/tiangolo).
* ⬆ Bump pulumi/actions from 5 to 6. PR [#380](https://github.com/fastapilabs/cloud/pull/380) by [@dependabot[bot]](https://github.com/apps/dependabot).
* 👷 Update CI to enable Dependabot without secrets. PR [#382](https://github.com/fastapilabs/cloud/pull/382) by [@tiangolo](https://github.com/tiangolo).
* ⬆ Bump astral-sh/setup-uv from 2 to 3. PR [#347](https://github.com/fastapilabs/cloud/pull/347) by [@dependabot[bot]](https://github.com/apps/dependabot).
* 👷🏻‍♀️ Add format frontend workflow. PR [#365](https://github.com/fastapilabs/cloud/pull/365) by [@alejsdev](https://github.com/alejsdev).
* 🧱 Add ebs volume for ec2 github runner instance. PR [#366](https://github.com/fastapilabs/cloud/pull/366) by [@estebanx64](https://github.com/estebanx64).
* 🔨 Fix `DEPLOY_ENVIRONMENT` env var in `deploy-kubectl.sh` script and GitHub Action. PR [#362](https://github.com/fastapilabs/cloud/pull/362) by [@tiangolo](https://github.com/tiangolo).
* ♻️ Use paths in both vite and tsconfig to make imports nicer. PR [#360](https://github.com/fastapilabs/cloud/pull/360) by [@patrick91](https://github.com/patrick91).
* 🧱 Add support for uv on builder. PR [#359](https://github.com/fastapilabs/cloud/pull/359) by [@estebanx64](https://github.com/estebanx64).
* ✨ Add initial private API. PR [#358](https://github.com/fastapilabs/cloud/pull/358) by [@patrick91](https://github.com/patrick91).
* 🧱 Add failed status for docker builder when it fails. PR [#353](https://github.com/fastapilabs/cloud/pull/353) by [@estebanx64](https://github.com/estebanx64).
* 👷 Run migrations in CI and deploy backend with our internal utils. PR [#351](https://github.com/fastapilabs/cloud/pull/351) by [@tiangolo](https://github.com/tiangolo).
* 👷 Implement sharding for Playwright tests. PR [#336](https://github.com/fastapilabs/cloud/pull/336) by [@alejsdev](https://github.com/alejsdev).
* 🧱 Add knative backend to autoscale min 1. PR [#350](https://github.com/fastapilabs/cloud/pull/350) by [@estebanx64](https://github.com/estebanx64).
* 👷 Update CI workflows format, remove alls-green from worfkows without multiple steps or matrix. PR [#346](https://github.com/fastapilabs/cloud/pull/346) by [@tiangolo](https://github.com/tiangolo).
* 👷 Refactor CI to generate client to use Python uv venv. PR [#345](https://github.com/fastapilabs/cloud/pull/345) by [@tiangolo](https://github.com/tiangolo).
* 🔒️ Fix tar files extraction in a safe way. PR [#338](https://github.com/fastapilabs/cloud/pull/338) by [@estebanx64](https://github.com/estebanx64).
* 👷 Run tests using Python env, setup with uv, and add tests to check Docker Compose works. PR [#344](https://github.com/fastapilabs/cloud/pull/344) by [@tiangolo](https://github.com/tiangolo).
* 🔧 Format generated client automatically. PR [#342](https://github.com/fastapilabs/cloud/pull/342) by [@tiangolo](https://github.com/tiangolo).
* 👷 Add lint GitHub Action workflow independent of tests. PR [#337](https://github.com/fastapilabs/cloud/pull/337) by [@tiangolo](https://github.com/tiangolo).
* 🐛 Fix knative serving revisions with the same name. PR [#334](https://github.com/fastapilabs/cloud/pull/334) by [@estebanx64](https://github.com/estebanx64).
* ♻️ Migrate from Poetry to uv. PR [#332](https://github.com/fastapilabs/cloud/pull/332) by [@tiangolo](https://github.com/tiangolo).
* 🔥 Remove `INSTALL_DEV`, we don't use it. PR [#331](https://github.com/fastapilabs/cloud/pull/331) by [@tiangolo](https://github.com/tiangolo).
* ♻️ Add Docker Compose watch instead of mount. PR [#327](https://github.com/fastapilabs/cloud/pull/327) by [@tiangolo](https://github.com/tiangolo).
* ♻️ Refactor CI to deploy to staging on `master`, tweak workflows and simplify code. PR [#316](https://github.com/fastapilabs/cloud/pull/316) by [@tiangolo](https://github.com/tiangolo).
* 🧱 Add Pulumi for repository-builder. PR [#318](https://github.com/fastapilabs/cloud/pull/318) by [@tiangolo](https://github.com/tiangolo).
* 👷 Add AWS ECR Registry fastapicloud-backend to Pulumi. PR [#317](https://github.com/fastapilabs/cloud/pull/317) by [@tiangolo](https://github.com/tiangolo).
* 👷 Add CI/CD for backend and builder. PR [#314](https://github.com/fastapilabs/cloud/pull/314) by [@estebanx64](https://github.com/estebanx64).
* 👷 Add EC2 instance as a self hosted github runner. PR [#295](https://github.com/fastapilabs/cloud/pull/295) by [@estebanx64](https://github.com/estebanx64).
* ♻️  Use id instead of slug *everywhere*. PR [#294](https://github.com/fastapilabs/cloud/pull/294) by [@patrick91](https://github.com/patrick91).
* ♻️ Pass team id instead of slug when creating apps. PR [#292](https://github.com/fastapilabs/cloud/pull/292) by [@patrick91](https://github.com/patrick91).
* ♻️ Refactor teams URLs. PR [#290](https://github.com/fastapilabs/cloud/pull/290) by [@patrick91](https://github.com/patrick91).
* 🧱 Add Sentry and FastAPI packages installed by default for docker builder. PR [#288](https://github.com/fastapilabs/cloud/pull/288) by [@estebanx64](https://github.com/estebanx64).
* 👷 Add redis in pulumi for backend services. PR [#270](https://github.com/fastapilabs/cloud/pull/270) by [@estebanx64](https://github.com/estebanx64).
* 💚 Fix typos and name split in docker builder. PR [#281](https://github.com/fastapilabs/cloud/pull/281) by [@estebanx64](https://github.com/estebanx64).
* 🚚 Rename Docker Compose file, with the new standard name, `compose.yml`. PR [#278](https://github.com/fastapilabs/cloud/pull/278) by [@tiangolo](https://github.com/tiangolo).
* 🔥 Remove extra, old files not used or no longer valid. PR [#275](https://github.com/fastapilabs/cloud/pull/275) by [@tiangolo](https://github.com/tiangolo).
* 👷 Playwright CI improvements. PR [#267](https://github.com/fastapilabs/cloud/pull/267) by [@patrick91](https://github.com/patrick91).
* 🔥 Remove unused scripts, not used, don't work (but add confusion). PR [#273](https://github.com/fastapilabs/cloud/pull/273) by [@tiangolo](https://github.com/tiangolo).
* 🔥 Remove unused workflows. PR [#272](https://github.com/fastapilabs/cloud/pull/272) by [@tiangolo](https://github.com/tiangolo).
* 🔨 Tweak script to comment preview, to not run on merge to master. PR [#269](https://github.com/fastapilabs/cloud/pull/269) by [@tiangolo](https://github.com/tiangolo).
* 👷 Add GitHub Action workflows to deploy frontend for branches, staging, production. PR [#268](https://github.com/fastapilabs/cloud/pull/268) by [@tiangolo](https://github.com/tiangolo).
* 📌 Pin pydantic-settings as generate-client is breaking on `BACKEND_CORS_ORIGINS`, to debug later. PR [#266](https://github.com/fastapilabs/cloud/pull/266) by [@tiangolo](https://github.com/tiangolo).
* ⬆ Bump tiangolo/issue-manager from 0.5.0 to 0.5.1. PR [#251](https://github.com/fastapilabs/cloud/pull/251) by [@dependabot[bot]](https://github.com/apps/dependabot).
* 👷 Update `issue-manager.yml`. PR [#246](https://github.com/fastapilabs/cloud/pull/246) by [@tiangolo](https://github.com/tiangolo).
* 👷 Update `.github/labeler.yml`. PR [#236](https://github.com/fastapilabs/cloud/pull/236) by [@alejsdev](https://github.com/alejsdev).
* 🚀 Add Pulumi K8s Deployment Customer Apps Flow. PR [#225](https://github.com/fastapilabs/cloud/pull/225) by [@estebanx64](https://github.com/estebanx64).
* 👷 Fix Pulumi stack name and make staging deploy manually. PR [#230](https://github.com/fastapilabs/cloud/pull/230) by [@tiangolo](https://github.com/tiangolo).
* 👷 Update `latest-changes` GitHub Action. PR [#224](https://github.com/fastapilabs/cloud/pull/224) by [@tiangolo](https://github.com/tiangolo).
* 👷 Update GitHub Action labeler to add only one label. PR [#213](https://github.com/fastapilabs/cloud/pull/213) by [@tiangolo](https://github.com/tiangolo).
* 👷 Update labeler GitHub Action. PR [#212](https://github.com/fastapilabs/cloud/pull/212) by [@tiangolo](https://github.com/tiangolo).
* 🔧 Update config for labeler. PR [#205](https://github.com/fastapilabs/cloud/pull/205) by [@tiangolo](https://github.com/tiangolo).
* 👷 Add GitHub Actions to add labels and check labels. PR [#204](https://github.com/fastapilabs/cloud/pull/204) by [@tiangolo](https://github.com/tiangolo).
* 🔧 Comment temporarily deployment workflows for staging and production. PR [#181](https://github.com/fastapilabs/cloud/pull/181) by [@alejsdev](https://github.com/alejsdev).
* 👷 Only run tests in CI, not the full backend service. PR [#162](https://github.com/fastapilabs/cloud/pull/162) by [@patrick91](https://github.com/patrick91).
* 👷 Separate lint step from tests. PR [#160](https://github.com/fastapilabs/cloud/pull/160) by [@patrick91](https://github.com/patrick91).
* 🔥 Remove issue templates. PR [#149](https://github.com/fastapilabs/cloud/pull/149) by [@alejsdev](https://github.com/alejsdev).
* 👷 Update structure of infra and add README explaining the components and deploy process. PR [#148](https://github.com/fastapilabs/cloud/pull/148) by [@tiangolo](https://github.com/tiangolo).
* 🔧 Update Traefik label configs for consistency with full-stack-fastapi-template. PR [#120](https://github.com/fastapilabs/cloud/pull/120) by [@tiangolo](https://github.com/tiangolo).
* ⬆ Bump actions/setup-python from 2 to 5. PR [#112](https://github.com/fastapilabs/cloud/pull/112) by [@dependabot[bot]](https://github.com/apps/dependabot).
* ⬆ Bump actions/checkout from 2 to 4. PR [#111](https://github.com/fastapilabs/cloud/pull/111) by [@dependabot[bot]](https://github.com/apps/dependabot).
* ⬆ Bump aws-actions/configure-aws-credentials from 1 to 4. PR [#110](https://github.com/fastapilabs/cloud/pull/110) by [@dependabot[bot]](https://github.com/apps/dependabot).
* ⬆ Bump pulumi/actions from 3 to 5. PR [#109](https://github.com/fastapilabs/cloud/pull/109) by [@dependabot[bot]](https://github.com/apps/dependabot).
* 💚 Tweak Dependabot with Pulumi. PR [#118](https://github.com/fastapilabs/cloud/pull/118) by [@tiangolo](https://github.com/tiangolo).
* 💚 Do not run Pulumi preview on Dependabot as it doesn't have secrets. PR [#117](https://github.com/fastapilabs/cloud/pull/117) by [@tiangolo](https://github.com/tiangolo).
* 👷 Update Smokeshow download artifact action. PR [#53](https://github.com/fastapilabs/cloud/pull/53) by [@tiangolo](https://github.com/tiangolo).
* 👷 Enable tmate for remote debugging. PR [#10](https://github.com/fastapilabs/cloud/pull/10) by [@tiangolo](https://github.com/tiangolo).
* 🎨 Ignore alembic from ruff lint and format. PR [#8](https://github.com/fastapilabs/cloud/pull/8) by [@estebanx64](https://github.com/estebanx64).
* 👷 Update CI to allow deploying envs to the same server. PR [#6](https://github.com/fastapilabs/cloud/pull/6) by [@tiangolo](https://github.com/tiangolo).
* 👷 Update config for Smokeshow, to allow setting a commit status. PR [#4](https://github.com/fastapilabs/cloud/pull/4) by [@tiangolo](https://github.com/tiangolo).
* 👷 Update CI token for private coverage. PR [#3](https://github.com/fastapilabs/cloud/pull/3) by [@tiangolo](https://github.com/tiangolo).
* 👷 Allow Smokeshow to run on a private repo. PR [#2](https://github.com/fastapilabs/cloud/pull/2) by [@tiangolo](https://github.com/tiangolo).
* 👷 Add token for latest-changes GitHub Action. PR [#1](https://github.com/fastapilabs/cloud/pull/1) by [@tiangolo](https://github.com/tiangolo).
* 👷 Update latest-changes token permissions. PR [#5](https://github.com/fastapilabs/cloud/pull/5) by [@tiangolo](https://github.com/tiangolo).
* 🔧 Update mypy config to ignore .venv directories. PR [#1155](https://github.com/tiangolo/full-stack-fastapi-template/pull/1155) by [@tiangolo](https://github.com/tiangolo).
* 🚨 Enable `ARG001` to prevent unused arguments. PR [#1152](https://github.com/tiangolo/full-stack-fastapi-template/pull/1152) by [@patrick91](https://github.com/patrick91).
* 🔥 Remove isort configuration, since we use Ruff now. PR [#1144](https://github.com/tiangolo/full-stack-fastapi-template/pull/1144) by [@patrick91](https://github.com/patrick91).
* 🔧 Update pre-commit config to exclude generated client folder. PR [#1150](https://github.com/tiangolo/full-stack-fastapi-template/pull/1150) by [@alejsdev](https://github.com/alejsdev).
* 🔧 Change `.nvmrc` format. PR [#1148](https://github.com/tiangolo/full-stack-fastapi-template/pull/1148) by [@patrick91](https://github.com/patrick91).
* 🎨 Ignore alembic from ruff lint and format. PR [#1131](https://github.com/tiangolo/full-stack-fastapi-template/pull/1131) by [@estebanx64](https://github.com/estebanx64).
* 🔧 Add GitHub templates for discussions and issues, and security policy. PR [#1105](https://github.com/tiangolo/full-stack-fastapi-template/pull/1105) by [@alejsdev](https://github.com/alejsdev).
* ⬆ Bump dawidd6/action-download-artifact from 3.1.2 to 3.1.4. PR [#1103](https://github.com/tiangolo/full-stack-fastapi-template/pull/1103) by [@dependabot[bot]](https://github.com/apps/dependabot).
* 🔧 Add Biome to pre-commit config. PR [#1098](https://github.com/tiangolo/full-stack-fastapi-template/pull/1098) by [@alejsdev](https://github.com/alejsdev).
* 🔥 Delete leftover celery file. PR [#727](https://github.com/tiangolo/full-stack-fastapi-template/pull/727) by [@dr-neptune](https://github.com/dr-neptune).
* ⚙️ Update pre-commit config with Prettier and ESLint. PR [#714](https://github.com/tiangolo/full-stack-fastapi-template/pull/714) by [@alejsdev](https://github.com/alejsdev).

## 0.6.0

Latest FastAPI, Pydantic, SQLModel 🚀

Brand new frontend with React, TS, Vite, Chakra UI, TanStack Query/Router, generated client/SDK 🎨

CI/CD - GitHub Actions 🤖

Test cov > 90% ✅

### Features

* ✨ Adopt SQLModel, create models, start using it. PR [#559](https://github.com/tiangolo/full-stack-fastapi-template/pull/559) by [@tiangolo](https://github.com/tiangolo).
* ✨ Upgrade items router with new SQLModel models, simplified logic, and new FastAPI Annotated dependencies. PR [#560](https://github.com/tiangolo/full-stack-fastapi-template/pull/560) by [@tiangolo](https://github.com/tiangolo).
* ✨ Migrate from pgAdmin to Adminer. PR [#692](https://github.com/tiangolo/full-stack-fastapi-template/pull/692) by [@tiangolo](https://github.com/tiangolo).
* ✨ Add support for setting `POSTGRES_PORT`. PR [#333](https://github.com/tiangolo/full-stack-fastapi-template/pull/333) by [@uepoch](https://github.com/uepoch).
* ⬆ Upgrade Flower version and command. PR [#447](https://github.com/tiangolo/full-stack-fastapi-template/pull/447) by [@maurob](https://github.com/maurob).
* 🎨 Improve styles. PR [#673](https://github.com/tiangolo/full-stack-fastapi-template/pull/673) by [@alejsdev](https://github.com/alejsdev).
* 🎨 Update theme. PR [#666](https://github.com/tiangolo/full-stack-fastapi-template/pull/666) by [@alejsdev](https://github.com/alejsdev).
* 👷 Add continuous deployment and refactors needed for it. PR [#667](https://github.com/tiangolo/full-stack-fastapi-template/pull/667) by [@tiangolo](https://github.com/tiangolo).
* ✨ Create endpoint to show password recovery email content and update email template. PR [#664](https://github.com/tiangolo/full-stack-fastapi-template/pull/664) by [@alejsdev](https://github.com/alejsdev).
* 🎨 Format with Prettier. PR [#646](https://github.com/tiangolo/full-stack-fastapi-template/pull/646) by [@alejsdev](https://github.com/alejsdev).
* ✅ Add tests to raise coverage to at least 90% and fix recover password logic. PR [#632](https://github.com/tiangolo/full-stack-fastapi-template/pull/632) by [@estebanx64](https://github.com/estebanx64).
* ⚙️ Add Prettier and ESLint config with pre-commit. PR [#640](https://github.com/tiangolo/full-stack-fastapi-template/pull/640) by [@alejsdev](https://github.com/alejsdev).
* 👷 Add coverage with Smokeshow to CI and badge. PR [#638](https://github.com/tiangolo/full-stack-fastapi-template/pull/638) by [@estebanx64](https://github.com/estebanx64).
* ✨ Migrate to TanStack Query (React Query) and TanStack Router. PR [#637](https://github.com/tiangolo/full-stack-fastapi-template/pull/637) by [@alejsdev](https://github.com/alejsdev).
* ✅ Add setup and teardown database for tests. PR [#626](https://github.com/tiangolo/full-stack-fastapi-template/pull/626) by [@estebanx64](https://github.com/estebanx64).
* ✨ Update new-frontend client. PR [#625](https://github.com/tiangolo/full-stack-fastapi-template/pull/625) by [@alejsdev](https://github.com/alejsdev).
* ✨ Add password reset functionality. PR [#624](https://github.com/tiangolo/full-stack-fastapi-template/pull/624) by [@alejsdev](https://github.com/alejsdev).
* ✨ Add private/public routing. PR [#621](https://github.com/tiangolo/full-stack-fastapi-template/pull/621) by [@alejsdev](https://github.com/alejsdev).
* 🔧 Add VS Code debug configs. PR [#620](https://github.com/tiangolo/full-stack-fastapi-template/pull/620) by [@tiangolo](https://github.com/tiangolo).
* ✨ Add `Not Found` page. PR [#595](https://github.com/tiangolo/full-stack-fastapi-template/pull/595) by [@alejsdev](https://github.com/alejsdev).
* ✨ Add new pages, components, panels, modals, and theme; refactor and improvements in existing components. PR [#593](https://github.com/tiangolo/full-stack-fastapi-template/pull/593) by [@alejsdev](https://github.com/alejsdev).
* ✨ Support delete own account and other tweaks. PR [#614](https://github.com/tiangolo/full-stack-fastapi-template/pull/614) by [@alejsdev](https://github.com/alejsdev).
* ✨ Restructure folders, allow editing of users/items, and implement other refactors and improvements. PR [#603](https://github.com/tiangolo/full-stack-fastapi-template/pull/603) by [@alejsdev](https://github.com/alejsdev).
* ✨ Add Copier, migrate from Cookiecutter, in a way that supports using the project as is, forking or cloning it. PR [#612](https://github.com/tiangolo/full-stack-fastapi-template/pull/612) by [@tiangolo](https://github.com/tiangolo).
* ➕ Replace black, isort, flake8, autoflake with ruff and upgrade mypy. PR [#610](https://github.com/tiangolo/full-stack-fastapi-template/pull/610) by [@tiangolo](https://github.com/tiangolo).
* ♻ Refactor items and services endpoints to return count and data, and add CI tests. PR [#599](https://github.com/tiangolo/full-stack-fastapi-template/pull/599) by [@estebanx64](https://github.com/estebanx64).
* ✨ Add support for updating items and upgrade SQLModel to 0.0.16 (which supports model object updates). PR [#601](https://github.com/tiangolo/full-stack-fastapi-template/pull/601) by [@tiangolo](https://github.com/tiangolo).
* ✨ Add dark mode to new-frontend and conditional sidebar items. PR [#600](https://github.com/tiangolo/full-stack-fastapi-template/pull/600) by [@alejsdev](https://github.com/alejsdev).
* ✨ Migrate to RouterProvider and other refactors . PR [#598](https://github.com/tiangolo/full-stack-fastapi-template/pull/598) by [@alejsdev](https://github.com/alejsdev).
* ✨ Add delete_user; refactor delete_item. PR [#594](https://github.com/tiangolo/full-stack-fastapi-template/pull/594) by [@alejsdev](https://github.com/alejsdev).
* ✨ Add state store to new frontend. PR [#592](https://github.com/tiangolo/full-stack-fastapi-template/pull/592) by [@alejsdev](https://github.com/alejsdev).
* ✨ Add form validation to Admin, Items and Login. PR [#616](https://github.com/tiangolo/full-stack-fastapi-template/pull/616) by [@alejsdev](https://github.com/alejsdev).
* ✨ Add Sidebar to new frontend. PR [#587](https://github.com/tiangolo/full-stack-fastapi-template/pull/587) by [@alejsdev](https://github.com/alejsdev).
* ✨ Add Login to new frontend. PR [#585](https://github.com/tiangolo/full-stack-fastapi-template/pull/585) by [@alejsdev](https://github.com/alejsdev).
* ✨ Include schemas in generated frontend client. PR [#584](https://github.com/tiangolo/full-stack-fastapi-template/pull/584) by [@alejsdev](https://github.com/alejsdev).
* ✨ Regenerate frontend client with recent changes. PR [#575](https://github.com/tiangolo/full-stack-fastapi-template/pull/575) by [@alejsdev](https://github.com/alejsdev).
* ♻️ Refactor API in `utils.py`. PR [#573](https://github.com/tiangolo/full-stack-fastapi-template/pull/573) by [@alejsdev](https://github.com/alejsdev).
* ✨ Update code for login API. PR [#571](https://github.com/tiangolo/full-stack-fastapi-template/pull/571) by [@tiangolo](https://github.com/tiangolo).
* ✨ Add client in frontend and client generation. PR [#569](https://github.com/tiangolo/full-stack-fastapi-template/pull/569) by [@alejsdev](https://github.com/alejsdev).
* 🐳 Set up Docker config for new-frontend. PR [#564](https://github.com/tiangolo/full-stack-fastapi-template/pull/564) by [@alejsdev](https://github.com/alejsdev).
* ✨ Set up new frontend with Vite, TypeScript and React. PR [#563](https://github.com/tiangolo/full-stack-fastapi-template/pull/563) by [@alejsdev](https://github.com/alejsdev).
* 📌 Add NodeJS version management and instructions. PR [#551](https://github.com/tiangolo/full-stack-fastapi-template/pull/551) by [@alejsdev](https://github.com/alejsdev).
* Add consistent errors for env vars not set. PR [#200](https://github.com/tiangolo/full-stack-fastapi-template/pull/200).
* Upgrade Traefik to version 2, keeping in sync with DockerSwarm.rocks. PR [#199](https://github.com/tiangolo/full-stack-fastapi-template/pull/199).
* Run tests with `TestClient`. PR [#160](https://github.com/tiangolo/full-stack-fastapi-template/pull/160).

### Fixes

* 🐛 Fix copier to handle string vars with spaces in quotes. PR [#631](https://github.com/tiangolo/full-stack-fastapi-template/pull/631) by [@estebanx64](https://github.com/estebanx64).
* 🐛 Fix allowing a user to update the email to the same email they already have. PR [#696](https://github.com/tiangolo/full-stack-fastapi-template/pull/696) by [@alejsdev](https://github.com/alejsdev).
* 🐛 Set up Sentry only when used. PR [#671](https://github.com/tiangolo/full-stack-fastapi-template/pull/671) by [@tiangolo](https://github.com/tiangolo).
* 🔥 Remove unnecessary validation. PR [#662](https://github.com/tiangolo/full-stack-fastapi-template/pull/662) by [@alejsdev](https://github.com/alejsdev).
* 🐛 Fix bug when editing own user. PR [#651](https://github.com/tiangolo/full-stack-fastapi-template/pull/651) by [@alejsdev](https://github.com/alejsdev).
* 🐛  Add `onClose` to `SidebarItems`. PR [#589](https://github.com/tiangolo/full-stack-fastapi-template/pull/589) by [@alejsdev](https://github.com/alejsdev).
* 🐛 Fix positional argument bug in `init_db.py`. PR [#562](https://github.com/tiangolo/full-stack-fastapi-template/pull/562) by [@alejsdev](https://github.com/alejsdev).
* 📌 Fix flower Docker image, pin version. PR [#396](https://github.com/tiangolo/full-stack-fastapi-template/pull/396) by [@sanggusti](https://github.com/sanggusti).
* 🐛 Fix Celery worker command. PR [#443](https://github.com/tiangolo/full-stack-fastapi-template/pull/443) by [@bechtold](https://github.com/bechtold).
* 🐛 Fix Poetry installation in Dockerfile and upgrade Python version and packages to fix Docker build. PR [#480](https://github.com/tiangolo/full-stack-fastapi-template/pull/480) by [@little7Li](https://github.com/little7Li).

### Refactors

* 🔧 Add missing dotenv variables. PR [#554](https://github.com/tiangolo/full-stack-fastapi-template/pull/554) by [@tiangolo](https://github.com/tiangolo).
* ⏪ Revert "⚙️ Add Prettier and ESLint config with pre-commit". PR [#644](https://github.com/tiangolo/full-stack-fastapi-template/pull/644) by [@alejsdev](https://github.com/alejsdev).
* 🙈 Add .prettierignore and include client folder. PR [#648](https://github.com/tiangolo/full-stack-fastapi-template/pull/648) by [@alejsdev](https://github.com/alejsdev).
* 🏷️ Add mypy to the GitHub Action for tests and fixed types in the whole project. PR [#655](https://github.com/tiangolo/full-stack-fastapi-template/pull/655) by [@estebanx64](https://github.com/estebanx64).
* 🔒️ Ensure the default values of "changethis" are not deployed. PR [#698](https://github.com/tiangolo/full-stack-fastapi-template/pull/698) by [@tiangolo](https://github.com/tiangolo).
* ◀ Revert "📸 Rename Dashboard to Home and update screenshots". PR [#697](https://github.com/tiangolo/full-stack-fastapi-template/pull/697) by [@alejsdev](https://github.com/alejsdev).
* 📸 Rename Dashboard to Home and update screenshots. PR [#693](https://github.com/tiangolo/full-stack-fastapi-template/pull/693) by [@alejsdev](https://github.com/alejsdev).
* 🐛 Fixed items count when retrieving data for all items by user. PR [#695](https://github.com/tiangolo/full-stack-fastapi-template/pull/695) by [@estebanx64](https://github.com/estebanx64).
* 🔥 Remove Celery and Flower, they are currently not used nor recommended. PR [#694](https://github.com/tiangolo/full-stack-fastapi-template/pull/694) by [@tiangolo](https://github.com/tiangolo).
* ✅ Add test for deleting user without privileges. PR [#690](https://github.com/tiangolo/full-stack-fastapi-template/pull/690) by [@alejsdev](https://github.com/alejsdev).
* ♻️ Refactor user update. PR [#689](https://github.com/tiangolo/full-stack-fastapi-template/pull/689) by [@alejsdev](https://github.com/alejsdev).
* 📌 Add Poetry lock to git. PR [#685](https://github.com/tiangolo/full-stack-fastapi-template/pull/685) by [@tiangolo](https://github.com/tiangolo).
* 🎨 Adjust color and spacing. PR [#684](https://github.com/tiangolo/full-stack-fastapi-template/pull/684) by [@alejsdev](https://github.com/alejsdev).
* 👷 Avoid creating unnecessary *.pyc files with PYTHONDONTWRITEBYTECODE=1. PR [#677](https://github.com/tiangolo/full-stack-fastapi-template/pull/677) by [@estebanx64](https://github.com/estebanx64).
* 🔧 Add `SMTP_SSL` option for older SMTP servers. PR [#365](https://github.com/tiangolo/full-stack-fastapi-template/pull/365) by [@Metrea](https://github.com/Metrea).
* ♻️ Refactor logic to allow running pytest tests locally. PR [#683](https://github.com/tiangolo/full-stack-fastapi-template/pull/683) by [@tiangolo](https://github.com/tiangolo).
* ♻ Update error messages. PR [#417](https://github.com/tiangolo/full-stack-fastapi-template/pull/417) by [@qu3vipon](https://github.com/qu3vipon).
* 🔧 Add a default Flower password. PR [#682](https://github.com/tiangolo/full-stack-fastapi-template/pull/682) by [@tiangolo](https://github.com/tiangolo).
* 🔧 Update VS Code debug config. PR [#676](https://github.com/tiangolo/full-stack-fastapi-template/pull/676) by [@tiangolo](https://github.com/tiangolo).
* ♻️ Refactor code structure for tests. PR [#674](https://github.com/tiangolo/full-stack-fastapi-template/pull/674) by [@tiangolo](https://github.com/tiangolo).
* 🔧 Set TanStack Router devtools only in dev mode. PR [#668](https://github.com/tiangolo/full-stack-fastapi-template/pull/668) by [@alejsdev](https://github.com/alejsdev).
* ♻️ Refactor email logic to allow re-using util functions for testing and development. PR [#663](https://github.com/tiangolo/full-stack-fastapi-template/pull/663) by [@tiangolo](https://github.com/tiangolo).
* 💬 Improve Delete Account description and confirmation. PR [#661](https://github.com/tiangolo/full-stack-fastapi-template/pull/661) by [@alejsdev](https://github.com/alejsdev).
* ♻️ Refactor email templates. PR [#659](https://github.com/tiangolo/full-stack-fastapi-template/pull/659) by [@alejsdev](https://github.com/alejsdev).
* 📝 Update deployment files and docs. PR [#660](https://github.com/tiangolo/full-stack-fastapi-template/pull/660) by [@tiangolo](https://github.com/tiangolo).
* 🔥 Remove unused schemas. PR [#656](https://github.com/tiangolo/full-stack-fastapi-template/pull/656) by [@alejsdev](https://github.com/alejsdev).
* 🔥 Remove old frontend. PR [#649](https://github.com/tiangolo/full-stack-fastapi-template/pull/649) by [@tiangolo](https://github.com/tiangolo).
* ♻ Move project source files to top level from src, update Sentry dependency. PR [#630](https://github.com/tiangolo/full-stack-fastapi-template/pull/630) by [@estebanx64](https://github.com/estebanx64).
* ♻ Refactor Python folder tree. PR [#629](https://github.com/tiangolo/full-stack-fastapi-template/pull/629) by [@estebanx64](https://github.com/estebanx64).
* ♻️ Refactor old CRUD utils and tests. PR [#622](https://github.com/tiangolo/full-stack-fastapi-template/pull/622) by [@alejsdev](https://github.com/alejsdev).
* 🔧 Update .env to allow local debug for the backend. PR [#618](https://github.com/tiangolo/full-stack-fastapi-template/pull/618) by [@tiangolo](https://github.com/tiangolo).
* ♻️ Refactor and update CORS, remove trailing slash from new Pydantic v2. PR [#617](https://github.com/tiangolo/full-stack-fastapi-template/pull/617) by [@tiangolo](https://github.com/tiangolo).
* 🎨 Format files with pre-commit and Ruff. PR [#611](https://github.com/tiangolo/full-stack-fastapi-template/pull/611) by [@tiangolo](https://github.com/tiangolo).
* 🚚 Refactor and simplify backend file structure. PR [#609](https://github.com/tiangolo/full-stack-fastapi-template/pull/609) by [@tiangolo](https://github.com/tiangolo).
* 🔥 Clean up old files no longer relevant. PR [#608](https://github.com/tiangolo/full-stack-fastapi-template/pull/608) by [@tiangolo](https://github.com/tiangolo).
* ♻ Re-structure Docker Compose files, discard Docker Swarm specific logic. PR [#607](https://github.com/tiangolo/full-stack-fastapi-template/pull/607) by [@tiangolo](https://github.com/tiangolo).
* ♻️ Refactor update endpoints and regenerate client for new-frontend. PR [#602](https://github.com/tiangolo/full-stack-fastapi-template/pull/602) by [@alejsdev](https://github.com/alejsdev).
* ✨ Add Layout to App. PR [#588](https://github.com/tiangolo/full-stack-fastapi-template/pull/588) by [@alejsdev](https://github.com/alejsdev).
* ♻️ Re-enable user update path operations for frontend client generation. PR [#574](https://github.com/tiangolo/full-stack-fastapi-template/pull/574) by [@alejsdev](https://github.com/alejsdev).
* ♻️ Remove type ignores and add `response_model`. PR [#572](https://github.com/tiangolo/full-stack-fastapi-template/pull/572) by [@alejsdev](https://github.com/alejsdev).
* ♻️ Refactor Users API and dependencies. PR [#561](https://github.com/tiangolo/full-stack-fastapi-template/pull/561) by [@alejsdev](https://github.com/alejsdev).
* ♻️ Refactor frontend Docker build setup, use plain NodeJS, use custom Nginx config, fix build for old Vue. PR [#555](https://github.com/tiangolo/full-stack-fastapi-template/pull/555) by [@tiangolo](https://github.com/tiangolo).
* ♻️ Refactor project generation, discard cookiecutter, use plain git/clone/fork. PR [#553](https://github.com/tiangolo/full-stack-fastapi-template/pull/553) by [@tiangolo](https://github.com/tiangolo).
* Refactor backend:
    * Simplify configs for tools and format to better support editor integration.
    * Add mypy configurations and plugins.
    * Add types to all the codebase.
    * Update types for SQLAlchemy models with plugin.
    * Update and refactor CRUD utils.
    * Refactor DB sessions to use dependencies with `yield`.
    * Refactor dependencies, security, CRUD, models, schemas, etc. To simplify code and improve autocompletion.
    * Change from PyJWT to Python-JOSE as it supports additional use cases.
    * Fix JWT tokens using user email/ID as the subject in `sub`.
    * PR [#158](https://github.com/tiangolo/full-stack-fastapi-template/pull/158).
* Simplify `docker-compose.*.yml` files, refactor deployment to reduce config files. PR [#153](https://github.com/tiangolo/full-stack-fastapi-template/pull/153).
* Simplify env var files, merge to a single `.env` file. PR [#151](https://github.com/tiangolo/full-stack-fastapi-template/pull/151).

### Upgrades

* 📌 Upgrade Poetry lock dependencies. PR [#702](https://github.com/tiangolo/full-stack-fastapi-template/pull/702) by [@tiangolo](https://github.com/tiangolo).
* ⬆️ Upgrade Python version and dependencies. PR [#558](https://github.com/tiangolo/full-stack-fastapi-template/pull/558) by [@tiangolo](https://github.com/tiangolo).
* ⬆ Bump tiangolo/issue-manager from 0.2.0 to 0.5.0. PR [#591](https://github.com/tiangolo/full-stack-fastapi-template/pull/591) by [@dependabot[bot]](https://github.com/apps/dependabot).
* Bump follow-redirects from 1.15.3 to 1.15.5 in /frontend. PR [#654](https://github.com/tiangolo/full-stack-fastapi-template/pull/654) by [@dependabot[bot]](https://github.com/apps/dependabot).
* Bump vite from 5.0.4 to 5.0.12 in /frontend. PR [#653](https://github.com/tiangolo/full-stack-fastapi-template/pull/653) by [@dependabot[bot]](https://github.com/apps/dependabot).
* Bump fastapi from 0.104.1 to 0.109.1 in /backend. PR [#687](https://github.com/tiangolo/full-stack-fastapi-template/pull/687) by [@dependabot[bot]](https://github.com/apps/dependabot).
* Bump python-multipart from 0.0.6 to 0.0.7 in /backend. PR [#686](https://github.com/tiangolo/full-stack-fastapi-template/pull/686) by [@dependabot[bot]](https://github.com/apps/dependabot).
* ⬆ Add `uvicorn[standard]` to include `watchgod` and `uvloop`. PR [#438](https://github.com/tiangolo/full-stack-fastapi-template/pull/438) by [@alonme](https://github.com/alonme).
* ⬆ Upgrade code to support pydantic V2. PR [#615](https://github.com/tiangolo/full-stack-fastapi-template/pull/615) by [@estebanx64](https://github.com/estebanx64).

### Docs

* 🦇 Add dark mode to `README.md`. PR [#703](https://github.com/tiangolo/full-stack-fastapi-template/pull/703) by [@alejsdev](https://github.com/alejsdev).
* 🍱 Update GitHub image. PR [#701](https://github.com/tiangolo/full-stack-fastapi-template/pull/701) by [@tiangolo](https://github.com/tiangolo).
* 🍱 Add GitHub image. PR [#700](https://github.com/tiangolo/full-stack-fastapi-template/pull/700) by [@tiangolo](https://github.com/tiangolo).
* 🚚 Rename project to Full Stack FastAPI Template. PR [#699](https://github.com/tiangolo/full-stack-fastapi-template/pull/699) by [@tiangolo](https://github.com/tiangolo).
* 📝 Update `README.md`. PR [#691](https://github.com/tiangolo/full-stack-fastapi-template/pull/691) by [@alejsdev](https://github.com/alejsdev).
* ✏ Fix typo in `development.md`. PR [#309](https://github.com/tiangolo/full-stack-fastapi-template/pull/309) by [@graue70](https://github.com/graue70).
* 📝 Add docs for wildcard domains. PR [#681](https://github.com/tiangolo/full-stack-fastapi-template/pull/681) by [@tiangolo](https://github.com/tiangolo).
* 📝 Add the required GitHub Actions secrets to docs. PR [#679](https://github.com/tiangolo/full-stack-fastapi-template/pull/679) by [@tiangolo](https://github.com/tiangolo).
* 📝 Update `README.md` and `deployment.md`. PR [#678](https://github.com/tiangolo/full-stack-fastapi-template/pull/678) by [@alejsdev](https://github.com/alejsdev).
* 📝 Update frontend `README.md`. PR [#675](https://github.com/tiangolo/full-stack-fastapi-template/pull/675) by [@alejsdev](https://github.com/alejsdev).
* 📝 Update deployment docs to use a different directory for traefik-public. PR [#670](https://github.com/tiangolo/full-stack-fastapi-template/pull/670) by [@tiangolo](https://github.com/tiangolo).
* 📸 Add new screenshots . PR [#657](https://github.com/tiangolo/full-stack-fastapi-template/pull/657) by [@alejsdev](https://github.com/alejsdev).
* 📝 Refactor README into separate README.md files for backend, frontend, deployment, development. PR [#639](https://github.com/tiangolo/full-stack-fastapi-template/pull/639) by [@tiangolo](https://github.com/tiangolo).
* 📝 Update README. PR [#628](https://github.com/tiangolo/full-stack-fastapi-template/pull/628) by [@tiangolo](https://github.com/tiangolo).
* 👷 Update GitHub Action latest-changes and move release notes to independent file. PR [#619](https://github.com/tiangolo/full-stack-fastapi-template/pull/619) by [@tiangolo](https://github.com/tiangolo).
* 📝 Update internal README and referred files. PR [#613](https://github.com/tiangolo/full-stack-fastapi-template/pull/613) by [@tiangolo](https://github.com/tiangolo).
* 📝 Update README with in construction notice. PR [#552](https://github.com/tiangolo/full-stack-fastapi-template/pull/552) by [@tiangolo](https://github.com/tiangolo).
* Add docs about reporting test coverage in HTML. PR [#161](https://github.com/tiangolo/full-stack-fastapi-template/pull/161).
* Add docs about removing the frontend, for an API-only app. PR [#156](https://github.com/tiangolo/full-stack-fastapi-template/pull/156).

### Internal

* 👷 Add Lint to GitHub Actions outside of tests. PR [#688](https://github.com/tiangolo/full-stack-fastapi-template/pull/688) by [@tiangolo](https://github.com/tiangolo).
* ⬆ Bump dawidd6/action-download-artifact from 2.28.0 to 3.1.2. PR [#643](https://github.com/tiangolo/full-stack-fastapi-template/pull/643) by [@dependabot[bot]](https://github.com/apps/dependabot).
* ⬆ Bump actions/upload-artifact from 3 to 4. PR [#642](https://github.com/tiangolo/full-stack-fastapi-template/pull/642) by [@dependabot[bot]](https://github.com/apps/dependabot).
* ⬆ Bump actions/setup-python from 4 to 5. PR [#641](https://github.com/tiangolo/full-stack-fastapi-template/pull/641) by [@dependabot[bot]](https://github.com/apps/dependabot).
* 👷 Tweak test GitHub Action names. PR [#672](https://github.com/tiangolo/full-stack-fastapi-template/pull/672) by [@tiangolo](https://github.com/tiangolo).
* 🔧 Add `.gitattributes` file to ensure LF endings for `.sh` files. PR [#658](https://github.com/tiangolo/full-stack-fastapi-template/pull/658) by [@estebanx64](https://github.com/estebanx64).
* 🚚 Move new-frontend to frontend. PR [#652](https://github.com/tiangolo/full-stack-fastapi-template/pull/652) by [@alejsdev](https://github.com/alejsdev).
* 🔧 Add script for ESLint. PR [#650](https://github.com/tiangolo/full-stack-fastapi-template/pull/650) by [@alejsdev](https://github.com/alejsdev).
* ⚙️ Add Prettier config. PR [#647](https://github.com/tiangolo/full-stack-fastapi-template/pull/647) by [@alejsdev](https://github.com/alejsdev).
* 🔧 Update pre-commit config. PR [#645](https://github.com/tiangolo/full-stack-fastapi-template/pull/645) by [@alejsdev](https://github.com/alejsdev).
* 👷 Add dependabot. PR [#547](https://github.com/tiangolo/full-stack-fastapi-template/pull/547) by [@tiangolo](https://github.com/tiangolo).
* 👷 Fix latest-changes GitHub Action token, strike 2. PR [#546](https://github.com/tiangolo/full-stack-fastapi-template/pull/546) by [@tiangolo](https://github.com/tiangolo).
* 👷 Fix latest-changes GitHub Action token config. PR [#545](https://github.com/tiangolo/full-stack-fastapi-template/pull/545) by [@tiangolo](https://github.com/tiangolo).
* 👷 Add latest-changes GitHub Action. PR [#544](https://github.com/tiangolo/full-stack-fastapi-template/pull/544) by [@tiangolo](https://github.com/tiangolo).
* Update issue-manager. PR [#211](https://github.com/tiangolo/full-stack-fastapi-template/pull/211).
* Add [GitHub Sponsors](https://github.com/sponsors/tiangolo) button. PR [#201](https://github.com/tiangolo/full-stack-fastapi-template/pull/201).
* Simplify scripts and development, update docs and configs. PR [#155](https://github.com/tiangolo/full-stack-fastapi-template/pull/155).

## 0.5.0

* Make the Traefik public network a fixed default of `traefik-public` as done in DockerSwarm.rocks, to simplify development and iteration of the project generator. PR [#150](https://github.com/tiangolo/full-stack-fastapi-template/pull/150).
* Update to PostgreSQL 12. PR [#148](https://github.com/tiangolo/full-stack-fastapi-template/pull/148). by [@RCheese](https://github.com/RCheese).
* Use Poetry for package management. Initial PR [#144](https://github.com/tiangolo/full-stack-fastapi-template/pull/144) by [@RCheese](https://github.com/RCheese).
* Fix Windows line endings for shell scripts after project generation with Cookiecutter hooks. PR [#149](https://github.com/tiangolo/full-stack-fastapi-template/pull/149).
* Upgrade Vue CLI to version 4. PR [#120](https://github.com/tiangolo/full-stack-fastapi-template/pull/120) by [@br3ndonland](https://github.com/br3ndonland).
* Remove duplicate `login` tag. PR [#135](https://github.com/tiangolo/full-stack-fastapi-template/pull/135) by [@Nonameentered](https://github.com/Nonameentered).
* Fix showing email in dashboard when there's no user's full name. PR [#129](https://github.com/tiangolo/full-stack-fastapi-template/pull/129) by [@rlonka](https://github.com/rlonka).
* Format code with Black and Flake8. PR [#121](https://github.com/tiangolo/full-stack-fastapi-template/pull/121) by [@br3ndonland](https://github.com/br3ndonland).
* Simplify SQLAlchemy Base class. PR [#117](https://github.com/tiangolo/full-stack-fastapi-template/pull/117) by [@airibarne](https://github.com/airibarne).
* Update CRUD utils for users, handling password hashing. PR [#106](https://github.com/tiangolo/full-stack-fastapi-template/pull/106) by [@mocsar](https://github.com/mocsar).
* Use `.` instead of `source` for interoperability. PR [#98](https://github.com/tiangolo/full-stack-fastapi-template/pull/98) by [@gucharbon](https://github.com/gucharbon).
* Use Pydantic's `BaseSettings` for settings/configs and env vars. PR [#87](https://github.com/tiangolo/full-stack-fastapi-template/pull/87) by [@StephenBrown2](https://github.com/StephenBrown2).
* Remove `package-lock.json` to let everyone lock their own versions (depending on OS, etc).
* Simplify Traefik service labels PR [#139](https://github.com/tiangolo/full-stack-fastapi-template/pull/139).
* Add email validation. PR [#40](https://github.com/tiangolo/full-stack-fastapi-template/pull/40) by [@kedod](https://github.com/kedod).
* Fix typo in README. PR [#83](https://github.com/tiangolo/full-stack-fastapi-template/pull/83) by [@ashears](https://github.com/ashears).
* Fix typo in README. PR [#80](https://github.com/tiangolo/full-stack-fastapi-template/pull/80) by [@abjoker](https://github.com/abjoker).
* Fix function name `read_item` and response code. PR [#74](https://github.com/tiangolo/full-stack-fastapi-template/pull/74) by [@jcaguirre89](https://github.com/jcaguirre89).
* Fix typo in comment. PR [#70](https://github.com/tiangolo/full-stack-fastapi-template/pull/70) by [@daniel-butler](https://github.com/daniel-butler).
* Fix Flower Docker configuration. PR [#37](https://github.com/tiangolo/full-stack-fastapi-template/pull/37) by [@dmontagu](https://github.com/dmontagu).
* Add new CRUD utils based on DB and Pydantic models. Initial PR [#23](https://github.com/tiangolo/full-stack-fastapi-template/pull/23) by [@ebreton](https://github.com/ebreton).
* Add normal user testing Pytest fixture. PR [#20](https://github.com/tiangolo/full-stack-fastapi-template/pull/20) by [@ebreton](https://github.com/ebreton).

## 0.4.0

* Fix security on resetting a password. Receive token as body, not query. PR [#34](https://github.com/tiangolo/full-stack-fastapi-template/pull/34).

* Fix security on resetting a password. Receive it as body, not query. PR [#33](https://github.com/tiangolo/full-stack-fastapi-template/pull/33) by [@dmontagu](https://github.com/dmontagu).

* Fix SQLAlchemy class lookup on initialization. PR [#29](https://github.com/tiangolo/full-stack-fastapi-template/pull/29) by [@ebreton](https://github.com/ebreton).

* Fix SQLAlchemy operation errors on database restart. PR [#32](https://github.com/tiangolo/full-stack-fastapi-template/pull/32) by [@ebreton](https://github.com/ebreton).

* Fix locations of scripts in generated README. PR [#19](https://github.com/tiangolo/full-stack-fastapi-template/pull/19) by [@ebreton](https://github.com/ebreton).

* Forward arguments from script to `pytest` inside container. PR [#17](https://github.com/tiangolo/full-stack-fastapi-template/pull/17) by [@ebreton](https://github.com/ebreton).

* Update development scripts.

* Read Alembic configs from env vars. PR <a href="https://github.com/tiangolo/full-stack-fastapi-template/pull/9" target="_blank">#9</a> by <a href="https://github.com/ebreton" target="_blank">@ebreton</a>.

* Create DB Item objects from all Pydantic model's fields.

* Update Jupyter Lab installation and util script/environment variable for local development.

## 0.3.0

* PR <a href="https://github.com/tiangolo/full-stack-fastapi-template/pull/14" target="_blank">#14</a>:
    * Update CRUD utils to use types better.
    * Simplify Pydantic model names, from `UserInCreate` to `UserCreate`, etc.
    * Upgrade packages.
    * Add new generic "Items" models, crud utils, endpoints, and tests. To facilitate re-using them to create new functionality. As they are simple and generic (not like Users), it's easier to copy-paste and adapt them to each use case.
    * Update endpoints/*path operations* to simplify code and use new utilities, prefix and tags in `include_router`.
    * Update testing utils.
    * Update linting rules, relax vulture to reduce false positives.
    * Update migrations to include new Items.
    * Update project README.md with tips about how to start with backend.

* Upgrade Python to 3.7 as Celery is now compatible too. PR <a href="https://github.com/tiangolo/full-stack-fastapi-template/pull/10" target="_blank">#10</a> by <a href="https://github.com/ebreton" target="_blank">@ebreton</a>.

## 0.2.2

* Fix frontend hijacking /docs in development. Using latest https://github.com/tiangolo/node-frontend with custom Nginx configs in frontend. <a href="https://github.com/tiangolo/full-stack-fastapi-template/pull/6" target="_blank">PR #6</a>.

## 0.2.1

* Fix documentation for *path operation* to get user by ID. <a href="https://github.com/tiangolo/full-stack-fastapi-template/pull/4" target="_blank">PR #4</a> by <a href="https://github.com/mpclarkson" target="_blank">@mpclarkson</a> in FastAPI.

* Set `/start-reload.sh` as a command override for development by default.

* Update generated README.

## 0.2.0

**<a href="https://github.com/tiangolo/full-stack-fastapi-template/pull/2" target="_blank">PR #2</a>**:

* Simplify and update backend `Dockerfile`s.
* Refactor and simplify backend code, improve naming, imports, modules and "namespaces".
* Improve and simplify Vuex integration with TypeScript accessors.
* Standardize frontend components layout, buttons order, etc.
* Add local development scripts (to develop this project generator itself).
* Add logs to startup modules to detect errors early.
* Improve FastAPI dependency utilities, to simplify and reduce code (to require a superuser).

## 0.1.2

* Fix path operation to update self-user, set parameters as body payload.

## 0.1.1

Several bug fixes since initial publication, including:

* Order of path operations for users.
* Frontend sending login data in the correct format.
* Add https://localhost variants to CORS.
