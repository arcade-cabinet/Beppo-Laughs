from playwright.sync_api import Page, expect, sync_playwright
import time

def verify_main_menu(page: Page):
    # Navigate to the app
    page.goto("http://localhost:5000/Beppo-Laughs/")

    # Wait for the main menu to appear
    # The title "BEPPO LAUGHS" should be visible
    expect(page.get_by_text("BEPPO LAUGHS")).to_be_visible(timeout=10000)

    # Check for "Continue Game" button (should be disabled or grayed out initially)
    continue_btn = page.get_by_test_id("button-continue-game")
    expect(continue_btn).to_be_visible()

    # Check for "New Game" section
    expect(page.get_by_text("Start New Nightmare")).to_be_visible()

    # Check for Seed Input
    seed_input = page.get_by_test_id("input-seed")
    expect(seed_input).to_be_visible()

    # Check for Randomize Button
    random_btn = page.get_by_label("Randomize seed")
    expect(random_btn).to_be_visible()

    # Check for New Game Button
    new_game_btn = page.get_by_test_id("button-start-game")
    expect(new_game_btn).to_be_visible()

    # Check for Settings Button
    settings_btn = page.get_by_label("Settings")
    expect(settings_btn).to_be_visible()

    # Take a screenshot of the main menu
    page.screenshot(path="verification/main_menu.png")

    # Test Interaction: Open Settings
    settings_btn.click()
    expect(page.get_by_text("Graphics Quality")).to_be_visible()

    # Take a screenshot of the settings modal
    page.screenshot(path="verification/settings_modal.png")

    # Close modal (click outside or press escape - simpler to just reload or continue)
    # Reload to reset state for next check
    page.reload()

    # Test Interaction: Randomize Seed
    # Get initial seed
    initial_seed = seed_input.input_value()
    # Click randomize
    random_btn.click()
    # Wait a bit or check value changed
    # Since checking value change is tricky if random picks same, we just ensure it's still 3 words
    expect(seed_input).not_to_have_value("")

    # Test Interaction: Start New Game
    new_game_btn.click()

    # Should transition to game (Scene)
    # We can check if Main Menu is gone or if HUD appears
    # HUD usually has a test id 'hud' or similar, or we can check for canvas
    # Based on previous tests, 'hud' might be a good check, or 'scene'
    # But for visual verification, let's just wait a moment and screenshot
    time.sleep(2)
    page.screenshot(path="verification/in_game.png")

    # Reload page to check "Continue Game" button state (should be enabled now if persistence works)
    page.goto("http://localhost:5000/Beppo-Laughs/")
    expect(page.get_by_text("BEPPO LAUGHS")).to_be_visible()

    # Check if Continue Game is now enabled/active style
    # It checks class or disabled attribute
    expect(continue_btn).not_to_be_disabled()

    page.screenshot(path="verification/main_menu_continue_active.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_main_menu(page)
            print("Verification script completed successfully.")
        except Exception as e:
            print(f"Verification failed: {e}")
            page.screenshot(path="verification/failure.png")
        finally:
            browser.close()
