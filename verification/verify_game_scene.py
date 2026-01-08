from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Use a larger viewport to capture the game UI
        page = browser.new_page(viewport={"width": 1280, "height": 720})

        try:
            # Navigate to the game with the correct base path
            page.goto("http://localhost:5000/Beppo-Laughs", timeout=60000)

            # Wait for the main menu to appear (Play Game button)
            page.wait_for_selector('button[data-testid="button-start-game"]', timeout=30000)

            # Click start game
            page.click('button[data-testid="button-start-game"]')

            # Wait for the game scene to load (look for canvas or HUD elements)
            page.wait_for_selector('canvas', timeout=30000)

            # Wait a few seconds for the 3D scene to initialize and render
            time.sleep(5)

            # Take a screenshot of the initial view
            page.screenshot(path="verification/game_scene_fixed.png")
            print("Screenshot taken at verification/game_scene_fixed.png")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
        finally:
            browser.close()

if __name__ == "__main__":
    run()
