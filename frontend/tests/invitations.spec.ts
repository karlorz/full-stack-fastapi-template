import { expect, test } from "@playwright/test"
import { findLastEmail } from "./utils/mailcatcher"
import { createTeam, createUser } from "./utils/privateApi"
import { randomEmail, randomTeamName } from "./utils/random"
import {
  logInUser,
  logOutUser,
  sendInvitation,
  viewInvitation,
} from "./utils/userUtils"

test.describe("User with role admin can manage team invitations", () => {
  test("User with role admin can send new invitations to a team", async ({
    page,
  }) => {
    const email = randomEmail()
    const teamName = randomTeamName()

    const team = await createTeam({
      name: teamName,
      ownerId: process.env.USER_ID!,
    })
    await sendInvitation(page, team.slug, email)

    await page
      .getByText(`Invitation sent to ${email}`)
      .waitFor({ state: "visible" })
  })

  test("User can see the invitation in the invitations list", async ({
    page,
  }) => {
    const email = randomEmail()
    const teamName = randomTeamName()

    const team = await createTeam({
      name: teamName,
      ownerId: process.env.USER_ID!,
    })

    await sendInvitation(page, team.slug, email)

    await page.getByText(/Invitation sent to/).waitFor({ state: "visible" })
    await page
      .getByText(/Invitation sent to/)
      .waitFor({ state: "hidden", timeout: 10000 })
    await page.getByRole("tab", { name: "Pending" }).click()
    await expect(page.getByRole("cell", { name: email })).toBeVisible()
    await expect(page.getByRole("cell", { name: "pending" })).toBeVisible()
  })

  test("User can cancel the invitation", async ({ page }) => {
    const email = randomEmail()
    const teamName = randomTeamName()

    const team = await createTeam({
      name: teamName,
      ownerId: process.env.USER_ID!,
    })
    await sendInvitation(page, team.slug, email)

    await page.getByText(/Invitation sent to/).waitFor({ state: "visible" })
    await page
      .getByText(/Invitation sent to/)
      .waitFor({ state: "hidden", timeout: 10000 })
    await page.getByRole("tab", { name: "Pending" }).click()
    await page.getByTestId("cancel-invitation").click()
    await expect(page.getByText("The invitation was cancelled")).toBeVisible()
  })

  test("Invitation with invalid email addresses", async ({ page }) => {
    const email = "invalidEmail"
    const teamName = randomTeamName()

    const team = await createTeam({
      name: teamName,
      ownerId: process.env.USER_ID!,
    })
    await sendInvitation(page, team.slug, email)

    await expect(page.getByText("Invalid email address")).toBeVisible()
  })

  test("Invitation to an existing team member", async ({ page }) => {
    const email = process.env.USER_EMAIL!
    const teamName = randomTeamName()

    const team = await createTeam({
      name: teamName,
      ownerId: process.env.USER_ID!,
    })
    await sendInvitation(page, team.slug, email)

    await expect(
      page.getByText("The user is already in the team"),
    ).toBeVisible()
  })

  test("Ensure user cannot send an invitation to an email that is already invited and validation messages are displayed", async ({
    page,
  }) => {
    const email = randomEmail()
    const teamName = randomTeamName()

    const team = await createTeam({
      name: teamName,
      ownerId: process.env.USER_ID!,
    })

    await sendInvitation(page, team.slug, email)
    await sendInvitation(page, team.slug, email)

    await expect(
      page.getByText("Invitation already exists for this user"),
    ).toBeVisible()
  })
})

test.describe("User can accept invitations to a team", () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test("User can accept invitations to a team", async ({ page, request }) => {
    const user1Email = randomEmail()
    const user2Email = randomEmail()

    const user = await createUser({ email: user1Email, password: "password" })
    await createUser({ email: user2Email, password: "password" })

    const teamName = randomTeamName()
    const team = await createTeam({ name: teamName, ownerId: user.id })

    // user 1 sends an invitation to user 2
    await logInUser(page, user1Email, "password")
    await page.goto(`/${team.slug}`)
    await sendInvitation(page, team.slug, user2Email)

    await page.getByText(/Invitation sent to/).waitFor({ state: "visible" })
    await page
      .getByText(/Invitation sent to/)
      .waitFor({ state: "hidden", timeout: 10000 })
    await logOutUser(page)

    // user 2 logs in and accepts the invitation
    await logInUser(page, user2Email, "password")

    const emailData = await findLastEmail({
      request,
      filter: (e) => e.recipients.includes(`<${user2Email}>`),
      timeout: 5000,
    })

    await page.goto(
      `${process.env.MAILCATCHER_HOST}/messages/${emailData.id}.html`,
    )

    const selector = 'a[href*="/team-invitation?token="]'
    let url = await page.getAttribute(selector, "href")
    url = url!.replace("http://localhost/", "http://localhost:5173/")
    await page.goto(url)

    await expect(page.getByTestId("accept-invitation")).toBeVisible()
    await page.getByRole("button", { name: "Join Team" }).click()
    await expect(
      page.getByText(`You are now a member of ${teamName}`),
    ).toBeVisible()
    await page.getByText("Ok", { exact: true }).click()
    await logOutUser(page)

    // check if user was added to the team members list
    await logInUser(page, user1Email, "password")
    await page.goto(`${team.slug}/settings`)
    await page.getByRole("tab", { name: "Active" }).click()
    expect(await page.getByTestId("team-members").innerText()).toContain(
      user2Email,
    )
  })
})

test.describe("Different scenarios for viewing invitations", () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test("Logged out invited user sees noauth-invitation modal", async ({
    page,
    request,
  }) => {
    const user1Email = randomEmail()
    const user2Email = randomEmail()

    const user = await createUser({ email: user1Email, password: "password" })
    await createUser({ email: user2Email, password: "password" })

    const teamName = randomTeamName()
    const team = await createTeam({ name: teamName, ownerId: user.id })

    // user 1 sends an invitation to user 2
    await logInUser(page, user1Email, "password")
    await page.goto(`/${team.slug}`)
    await sendInvitation(page, team.slug, user2Email)

    await page.getByText(/Invitation sent to/).waitFor({ state: "visible" })
    await page
      .getByText(/Invitation sent to/)
      .waitFor({ state: "hidden", timeout: 10000 })
    await logOutUser(page)

    // view invitation logged out
    await viewInvitation(page, user2Email, request)

    // check for the noauth-invitation modal
    await expect(page.getByTestId("noauth-invitation")).toBeVisible()
  })

  test("Invited user is not the same logged in", async ({ page, request }) => {
    const user1Email = randomEmail()
    const user2Email = randomEmail()
    const user3Email = randomEmail()

    const user = await createUser({ email: user1Email, password: "password" })
    await createUser({ email: user3Email, password: "password" })

    const teamName = randomTeamName()
    const team = await createTeam({ name: teamName, ownerId: user.id })

    // user 1 sends an invitation to user 2
    await logInUser(page, user1Email, "password")
    await page.goto(`/${team.slug}`)
    await sendInvitation(page, team.slug, user2Email)

    await page.getByText(/Invitation sent to/).waitFor({ state: "visible" })
    await page
      .getByText(/Invitation sent to/)
      .waitFor({ state: "hidden", timeout: 10000 })
    await logOutUser(page)

    // user 3 logs in and tries to view the invitation
    await logInUser(page, user3Email, "password")
    await viewInvitation(page, user2Email, request)

    // check for no matching account
    await expect(page.getByTestId("no-matching-account")).toBeVisible()
  })
})
