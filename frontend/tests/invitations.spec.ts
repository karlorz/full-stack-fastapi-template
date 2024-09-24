import { expect, test } from "@playwright/test"
import { findLastEmail } from "./utils/mailcatcher"
import { randomEmail, randomTeamName, slugify } from "./utils/random"
import {
  createTeam,
  logInUser,
  logOutUser,
  sendInvitation,
  signUpNewUser,
  viewInvitation,
} from "./utils/userUtils"

test.describe("User with role admin can manage team invitations", () => {
  test("User with role admin can send new invitations to a team", async ({
    page,
  }) => {
    const email = randomEmail()
    const teamName = randomTeamName()
    const teamSlug = slugify(teamName)

    await createTeam(page, teamName)
    await sendInvitation(page, teamSlug, email)

    await expect(
      page.getByText(`The invitation has been sent to ${email}`),
    ).toBeVisible()
  })

  test("User can see the invitation in the invitations list", async ({
    page,
  }) => {
    const email = randomEmail()
    const teamName = randomTeamName()
    const teamSlug = slugify(teamName)

    await createTeam(page, teamName)
    await sendInvitation(page, teamSlug, email)
    await page.getByRole("button", { name: "Ok" }).click()

    await expect(page.getByRole("cell", { name: email })).toBeVisible()
    await expect(page.getByRole("cell", { name: "pending" })).toBeVisible()
  })

  test("User can cancel the invitation", async ({ page }) => {
    const email = randomEmail()
    const teamName = randomTeamName()
    const teamSlug = slugify(teamName)

    await createTeam(page, teamName)
    await sendInvitation(page, teamSlug, email)
    await page.getByRole("button", { name: "Ok" }).click()

    await page.getByTestId("cancel-invitation").click()
    await expect(page.getByText("The invitation was cancelled")).toBeVisible()
  })

  test("Invitation with invalid email addresses", async ({ page }) => {
    const email = "invalidEmail"
    const teamName = randomTeamName()
    const teamSlug = slugify(teamName)

    await createTeam(page, teamName)
    await sendInvitation(page, teamSlug, email)

    await expect(page.getByText("Invalid email address")).toBeVisible()
  })

  test("Invitation to an existing team member", async ({ page }) => {
    const email = "admin@example.com"
    const teamName = randomTeamName()
    const teamSlug = slugify(teamName)

    await createTeam(page, teamName)
    await sendInvitation(page, teamSlug, email)

    await expect(
      page.getByText("The user is already in the team"),
    ).toBeVisible()
  })

  test("Ensure user cannot send an invitation to an email that is already invited and validation messages are displayed", async ({
    page,
  }) => {
    const email = randomEmail()
    const teamName = randomTeamName()
    const teamSlug = slugify(teamName)

    await createTeam(page, teamName)
    await sendInvitation(page, teamSlug, email)
    await sendInvitation(page, teamSlug, email)

    await expect(
      page.getByText("Invitation already exists for this user"),
    ).toBeVisible()
  })
})

test.describe("User can accept invitations to a team", () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test("User can accept invitations to a team", async ({ page, request }) => {
    const user1Name = "TestUserA"
    const user2Name = "TestUserB"
    const user1Email = randomEmail()
    const user2Email = randomEmail()

    await signUpNewUser(page, user1Name, user1Email, "password", request)
    await signUpNewUser(page, user2Name, user2Email, "password", request)

    // user 1 logs in and creates a team
    await logInUser(page, user1Email, "password")
    const teamName = randomTeamName()
    const teamSlug = slugify(teamName)
    await createTeam(page, teamName)

    // user 1 sends an invitation to user 2
    await page.goto(`/${teamSlug}`)
    await sendInvitation(page, teamSlug, user2Email)
    await page.getByRole("button", { name: "Ok" }).click()
    await logOutUser(page, teamName)

    // user 2 logs in and accepts the invitation
    await logInUser(page, user2Email, "password")

    const emailData = await findLastEmail({
      request,
      filter: (e) => e.recipients.includes(`<${user2Email}>`),
      timeout: 5000,
    })

    await page.goto(`http://localhost:1080/messages/${emailData.id}.html`)

    const selector = 'a[href*="/team-invitation?token="]'
    let url = await page.getAttribute(selector, "href")
    url = url!.replace("http://localhost/", "http://localhost:5173/")
    await page.goto(url)

    await expect(page.getByTestId("accept-invitation")).toBeVisible()
    await page.getByRole("button", { name: "Join Team" }).click()
    await expect(
      page.getByText(`You are now a member of ${teamName}`),
    ).toBeVisible()
    await logOutUser(page, user2Name)

    // check if user was added to the team members list
    await logInUser(page, user1Email, "password")
    await page.goto(`${teamSlug}/settings`)

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
    const user1Name = "TestUserC"
    const user2Name = "TestUserD"
    const user1Email = randomEmail()
    const user2Email = randomEmail()

    await signUpNewUser(page, user1Name, user1Email, "password", request)
    await signUpNewUser(page, user2Name, user2Email, "password", request)

    // user 1 logs in and creates a team
    await logInUser(page, user1Email, "password")
    const teamName = randomTeamName()
    const teamSlug = slugify(teamName)
    await createTeam(page, teamName)

    // user 1 sends an invitation to user 2
    await page.goto(`/${teamSlug}`)
    await sendInvitation(page, teamSlug, user2Email)
    await page.getByRole("button", { name: "Ok" }).click()
    await logOutUser(page, teamName)

    // view invitation logged out
    await viewInvitation(page, user2Email, request)

    // check for the noauth-invitation modal
    await expect(page.getByTestId("noauth-invitation")).toBeVisible()
  })

  test("Invited user is not the same logged in", async ({ page, request }) => {
    const user1Name = "TestUserE"
    const user3Name = "TestUserF"
    const user1Email = randomEmail()
    const user2Email = randomEmail()
    const user3Email = randomEmail()

    await signUpNewUser(page, user1Name, user1Email, "password", request)
    await signUpNewUser(page, user3Name, user3Email, "password", request)

    // user 1 logs in and creates a team
    await logInUser(page, user1Email, "password")
    const teamName = randomTeamName()
    const teamSlug = slugify(teamName)
    await createTeam(page, teamName)

    // user 1 sends an invitation to user 2
    await page.goto(`/${teamSlug}`)
    await sendInvitation(page, teamSlug, user2Email)
    await page.getByRole("button", { name: "Ok" }).click()
    await logOutUser(page, teamName)

    // user 3 logs in and tries to view the invitation
    await logInUser(page, user3Email, "password")
    await viewInvitation(page, user2Email, request)

    // check for no matching account
    await expect(page.getByTestId("no-matching-account")).toBeVisible()
  })
})
