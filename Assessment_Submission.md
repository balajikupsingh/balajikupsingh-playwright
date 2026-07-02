# Automation Engineer Assessment Submission
**Candidate:** Balaji Kupsingh

---

## 1. Project Overview & Repository Structure

This submission demonstrates a production-grade, decoupled testing architecture. It consists of two distinct repositories, simulating a real-world scenario where application code and testing infrastructure are maintained separately but integrated via CI/CD.

### The Application (`balajikupsingh-application`)
I selected the **"RealWorld" Conduit Application** (a Medium.com clone).
*   **Backend:** Node/Express/Sequelize (using local SQLite for CI/CD simplicity)
*   **Frontend:** React/Redux SPA
*   *Why this app?* It contains real authorization logic and real data relationships (favoriting, article ownership, comments). Testing a toy CRUD app doesn't demonstrate the ability of an automation engineer or an AI agent to handle complex, real-world business rules.

### The Automation Framework (`balajikupsingh-playwright`)
*   Contains a central Playwright test suite.
*   Houses the Python-based AI Test-Writing Agent.
*   Contains the CI/CD pipeline definition that gates the application repository.

---

## 2. CI/CD & Pull Request Gating Strategy

The core requirement of this exercise is ensuring that a developer's Pull Request in the application repository is securely gated by the testing repository. 

### The Mechanism
1.  **Workflow Trigger:** A developer opens a PR against the `main` branch of the Application repository.
2.  **Cross-Repo Checkout:** A GitHub Action (located in `.github/workflows/playwright-e2e.yml`) uses a Personal Access Token (`CROSS_REPO_PAT`) to securely check out the Playwright testing repository.
3.  **Local Bootstrapping:** The action patches the backend to use SQLite, installs dependencies for both the frontend and backend, and boots them locally in the background (ports 3000 and 4100).
4.  **Execution & Gating:** Playwright executes the E2E and API tests against the live local instances. 
5.  **Branch Protection:** The `main` branch of the Application repository has a **Branch Protection Rule** enforcing that the "E2E Tests" status check must pass. The "Merge" button is hard-blocked if any test fails.

**CI/CD Snippet Example:**
```yaml
      # Check out the testing repository
      - name: Checkout Playwright Repo
        uses: actions/checkout@v4
        with:
          repository: balajikupsingh/balajikupsingh-playwright
          ref: main 
          token: ${{ secrets.CROSS_REPO_PAT }}
```

---

## 3. The Test Suite

The Playwright suite is broken down into three distinct test execution levels:

*   **API Tests (`tests/api/`):** Validates raw backend functionality using Playwright's API request fixtures. (e.g., verifying that favoriting an article without an auth token correctly yields a 500/401 error, documenting a known backend defect).
*   **Browser E2E Tests (`tests/e2e/`):** Full Chromium-based tests that launch the frontend UI, register a new user, log in, publish an article, and verify DOM rendering.
*   **Agent-Generated Tests (`tests/generated/`):** Tests written dynamically by the AI agent.

---

## 4. The Test-Writing Agent (Task 2)

I have built a Python-based test-writing agent (`agent/generate_tests.py`) capable of parsing real feature files (like `routes/api/articles.js`) and outputting grounded, runnable Playwright tests.

### How it works:
*   The agent uses an LLM (Gemini / Anthropic Claude).
*   It reads the raw source code of the feature file to ensure the tests are strictly grounded in actual implementation details, rather than generating plausible but useless boilerplate.
*   It outputs `.spec.ts` files directly into the `tests/generated/` directory.

### Example Generation Loop
```bash
python3 agent/generate_tests.py \
  --provider gemini \
  --model gemini-2.5-flash \
  --feature-file ../backend-app/routes/api/articles.js \
  --focus "comment creation and deletion" \
  --out tests/generated/comments.generated.spec.ts
```

> [!WARNING]  
> **API Key Required for Evaluators**  
> If you intend to run the `generate_tests.py` agent locally on your machine, **you must provide your own API Key**. 
> Please create a `.env` file in the root of the project containing either `GEMINI_API_KEY='your-key'` or `ANTHROPIC_API_KEY='your-key'`. 

---

## 5. Local Evaluation Instructions

If you wish to evaluate the entire pipeline locally, I have provided a unified bash script that mirrors the GitHub Actions pipeline:

1. Clone both repositories into the same parent folder.
2. Navigate to the testing repository: `cd tester-repo`
3. Execute the automated local runner: `./run-all.sh`

This script will seamlessly install all Node.js dependencies, compile the SQLite bindings, start both the frontend and backend servers in the background, and execute the Playwright test suite, automatically cleaning up the processes when finished.
