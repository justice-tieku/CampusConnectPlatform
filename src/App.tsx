import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";

type View =
  | "home"
  | "signup"
  | "login"
  | "verify"
  | "forgot"
  | "reset"
  | "onboarding"
  | "dashboard"
  | "projects"
  | "my-projects"
  | "internships"
  | "mentors"
  | "courses"
  | "people"
  | "saved"
  | "profile"
  | "notifications";
type AccountType = "Student" | "Staff" | "Admin";
type Experience = "Beginner" | "Intermediate" | "Advanced";

type Account = {
  name: string;
  email: string;
  passwordHash: string;
  accountType: AccountType;
  university: string;
  verified: boolean;
  verificationToken: string;
  createdAt: string;
  bio: string;
  techStack: string[];
  experience: Experience;
  availability: string;
  github: string;
  onboardingComplete: boolean;
  onboardingSkipped: boolean;
  resetToken?: string;
  resetExpiresAt?: number;
};

const STORAGE_KEY = "campus-connect-account";
const SESSION_KEY = "campus-connect-session";
const PROJECTS_KEY = "campus-connect-projects";
const NOTIFICATIONS_KEY = "campus-connect-notifications";

type JoinRequest = {
  id: string;
  applicantEmail: string;
  applicantName: string;
  message: string;
  status: "pending" | "accepted" | "declined";
};

type Project = {
  id: string;
  title: string;
  description: string;
  category: string;
  techStack: string[];
  roles: string[];
  teamSize: number;
  status: "Open" | "In progress" | "Completed";
  ownerEmail: string;
  ownerName: string;
  members: string[];
  requests: JoinRequest[];
};

type Notice = {
  id: string;
  recipient: string;
  title: string;
  detail: string;
  createdAt: string;
  read: boolean;
};

type SavedItem = {
  id: string;
  type: "Project" | "Internship" | "Mentor" | "Course";
  title: string;
  subtitle: string;
};

const STARTER_PROJECTS: Project[] = [
  {
    id: "study-sync",
    title: "StudySync",
    description: "A collaborative study planner that helps university teams share goals, notes, and accountability streaks.",
    category: "EdTech",
    techStack: ["React", "TypeScript", "Figma"],
    roles: ["Frontend developer", "Product designer"],
    teamSize: 5,
    status: "Open",
    ownerEmail: "maya@campusconnect.demo",
    ownerName: "Maya Chen",
    members: ["Maya Chen", "Samuel Okoro"],
    requests: [],
  },
  {
    id: "green-route",
    title: "GreenRoute",
    description: "A mobile-first tool for finding lower-emission routes and tracking sustainable travel habits.",
    category: "Climate",
    techStack: ["Flutter", "Python", "Machine Learning"],
    roles: ["Mobile developer", "Data scientist"],
    teamSize: 4,
    status: "Open",
    ownerEmail: "leo@campusconnect.demo",
    ownerName: "Leo Martins",
    members: ["Leo Martins"],
    requests: [],
  },
  {
    id: "access-map",
    title: "AccessMap",
    description: "Community-powered accessibility reviews for lecture halls, libraries, and public campus spaces.",
    category: "Social impact",
    techStack: ["React", "Node.js", "Java"],
    roles: ["Backend developer"],
    teamSize: 6,
    status: "In progress",
    ownerEmail: "amina@campusconnect.demo",
    ownerName: "Amina Yusuf",
    members: ["Amina Yusuf", "Chris Lee", "Nora James"],
    requests: [],
  },
];
const HERO_IMAGE =
  "https://images.unsplash.com/photo-1758270705317-3ef6142d306f?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=1400";

async function hashPassword(password: string) {
  const bytes = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function routeFromHash(): View {
  const route = window.location.hash.slice(1).split("?")[0] as View;
  const routes: View[] = ["signup", "login", "verify", "forgot", "reset", "onboarding", "dashboard", "projects", "my-projects", "internships", "mentors", "courses", "people", "saved", "profile", "notifications"];
  return routes.includes(route) ? route : "home";
}

function Icon({
  children,
  size = 20,
  className = "",
}: {
  children: ReactNode;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
    >
      {children}
    </svg>
  );
}

function ArrowIcon() {
  return (
    <Icon size={18}>
      <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </Icon>
  );
}

function Logo({ onClick }: { onClick: () => void }) {
  return (
    <button className="brand" onClick={onClick} type="button">
      <span className="brand-mark">
        <span />
        <span />
        <span />
      </span>
      <span>Campus Connect</span>
    </button>
  );
}

function Header({
  navigate,
  simple = false,
}: {
  navigate: (view: View) => void;
  simple?: boolean;
}) {
  return (
    <header className={`site-header ${simple ? "simple" : ""}`}>
      <Logo onClick={() => navigate("home")} />
      {!simple && (
        <>
          <nav aria-label="Main navigation" className="desktop-nav">
            <button onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })} type="button">
              How it works
            </button>
            <button onClick={() => document.getElementById("community")?.scrollIntoView({ behavior: "smooth" })} type="button">
              Community
            </button>
            <button onClick={() => document.getElementById("opportunities")?.scrollIntoView({ behavior: "smooth" })} type="button">
              Opportunities
            </button>
          </nav>
          <div className="header-actions">
            <button className="text-button" onClick={() => navigate("login")} type="button">
              Log in
            </button>
            <button className="button button-dark button-small" onClick={() => navigate("signup")} type="button">
              Join Campus Connect
            </button>
          </div>
        </>
      )}
      {simple && (
        <button className="text-button back-home" onClick={() => navigate("home")} type="button">
          <Icon size={17}>
            <path d="M19 12H5m6 6-6-6 6-6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
          </Icon>
          Back to home
        </button>
      )}
    </header>
  );
}

function Landing({ navigate }: { navigate: (view: View) => void }) {
  return (
    <div className="page-shell">
      <Header navigate={navigate} />
      <main>
        <section className="hero">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="eyebrow-dot" />
              The global student builder community
            </div>
            <h1>
              Find your people.
              <br />
              <em>Build what matters.</em>
            </h1>
            <p>
              Meet ambitious students, team up on real-world projects, and discover internship opportunities made for emerging talent.
            </p>
            <div className="hero-actions">
              <button className="button button-coral" onClick={() => navigate("signup")} type="button">
                Create your account <ArrowIcon />
              </button>
              <button className="button button-ghost" onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })} type="button">
                See how it works
              </button>
            </div>
            <div className="member-proof">
              <div className="avatar-stack" aria-hidden="true">
                <span>AM</span><span>JK</span><span>SL</span><span>+</span>
              </div>
              <p><strong>2,400+ students</strong><br />already building together</p>
            </div>
          </div>

          <div className="hero-visual">
            <div className="image-frame">
              <img alt="University students collaborating around a laptop" src={HERO_IMAGE} />
              <a className="photo-credit" href="https://unsplash.com/@silverkblack" rel="noreferrer" target="_blank">
                Photo by Vitaly Gariev
              </a>
            </div>
            <div className="project-card floating-card">
              <span className="card-kicker">Trending project</span>
              <div className="project-title-row">
                <span className="project-icon">
                  <Icon size={20}>
                    <path d="M5 8.5 12 4l7 4.5v7L12 20l-7-4.5v-7Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.7" />
                    <path d="m8.5 11 2 2 4.5-4.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" />
                  </Icon>
                </span>
                <div><strong>StudySync</strong><small>Productivity · EdTech</small></div>
              </div>
              <div className="stack-list"><span>React</span><span>Node.js</span><span>Figma</span></div>
              <div className="card-meta"><span>4 builders</span><b>2 spots open</b></div>
            </div>
            <div className="match-pill">
              <span>
                <Icon size={17}>
                  <path d="m12 3 1.35 4.15a2 2 0 0 0 1.28 1.28L19 10l-4.37 1.57a2 2 0 0 0-1.28 1.28L12 17l-1.35-4.15a2 2 0 0 0-1.28-1.28L5 10l4.37-1.57a2 2 0 0 0 1.28-1.28L12 3Z" fill="currentColor" />
                </Icon>
              </span>
              94% skill match
            </div>
          </div>
        </section>

        <section className="how-section" id="how-it-works">
          <div className="section-heading">
            <div>
              <span className="section-label">HOW IT WORKS</span>
              <h2>Your next big idea starts here.</h2>
            </div>
            <p>From a spark of an idea to a project you’re proud to share. Campus Connect helps you find the right people at every step.</p>
          </div>
          <div className="steps-grid">
            <article>
              <span className="step-number">01</span>
              <div className="step-icon blue">
                <Icon size={26}><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4L16.5 3.5Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" /></Icon>
              </div>
              <h3>Post your project</h3>
              <p>Share your idea, the skills you need, and the impact you want to make.</p>
              <span className="step-link">Bring an idea to life <ArrowIcon /></span>
            </article>
            <article>
              <span className="step-number">02</span>
              <div className="step-icon yellow">
                <Icon size={26}><circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.7" /><path d="m16 16 4 4M11 8v6M8 11h6" stroke="currentColor" strokeLinecap="round" strokeWidth="1.7" /></Icon>
              </div>
              <h3>Get matched</h3>
              <p>Our matching system connects your tech stack with students ready to contribute.</p>
              <span className="step-link">Meet your teammates <ArrowIcon /></span>
            </article>
            <article>
              <span className="step-number">03</span>
              <div className="step-icon coral">
                <Icon size={26}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" /></Icon>
              </div>
              <h3>Join &amp; build</h3>
              <p>Request to join a team, collaborate across borders, and build something real.</p>
              <span className="step-link">Start collaborating <ArrowIcon /></span>
            </article>
          </div>
        </section>

        <section className="community-section" id="community">
          <span className="section-label">BUILT FOR CURIOUS PEOPLE</span>
          <h2>Different perspectives.<br /><em>One shared ambition.</em></h2>
          <div className="community-grid">
            <div><strong>2.4k+</strong><span>Student builders</span></div>
            <div><strong>68</strong><span>Universities</span></div>
            <div><strong>42</strong><span>Countries represented</span></div>
            <div><strong>320+</strong><span>Projects launched</span></div>
          </div>
        </section>

        <section className="cta-section" id="opportunities">
          <div>
            <span className="section-label">YOUR PEOPLE ARE HERE</span>
            <h2>Ready to build something <em>remarkable?</em></h2>
          </div>
          <button className="button button-coral" onClick={() => navigate("signup")} type="button">
            Join the community <ArrowIcon />
          </button>
        </section>
      </main>
      <footer>
        <Logo onClick={() => navigate("home")} />
        <p>Where student ideas become real-world experience.</p>
        <div><button type="button">About</button><button type="button">Terms</button><button type="button">Privacy</button><button type="button">Contact</button></div>
        <small>© 2025 Campus Connect</small>
      </footer>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className={`field ${error ? "has-error" : ""}`}>
      <span>{label}</span>
      {children}
      {error && <small>{error}</small>}
    </label>
  );
}

function AuthAside() {
  return (
    <aside className="auth-aside">
      <div className="auth-aside-content">
        <span className="aside-badge">BUILD BEYOND THE CLASSROOM</span>
        <blockquote>“The best way to predict the future is to <em>build it together.</em>”</blockquote>
        <div className="aside-line" />
        <p>Join students from 68 universities who are turning ideas into experience.</p>
      </div>
      <div className="orbit orbit-one" />
      <div className="orbit orbit-two" />
      <div className="code-chip chip-one">{"{ build: together }"}</div>
      <div className="code-chip chip-two">idea → impact</div>
    </aside>
  );
}

function Signup({
  navigate,
  onCreated,
}: {
  navigate: (view: View) => void;
  onCreated: (account: Account) => boolean;
}) {
  const [form, setForm] = useState({
    name: "", email: "", password: "", confirmPassword: "", accountType: "Student" as AccountType, university: "", terms: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);

  const update = (key: string, value: string | boolean) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: "" }));
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (form.name.trim().length < 2) next.name = "Please enter your full name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = "Enter a valid email address.";
    if (form.password.length < 8) next.password = "Use at least 8 characters.";
    if (form.password !== form.confirmPassword) next.confirmPassword = "Passwords do not match.";
    if (!form.university.trim()) next.university = "Please enter your university.";
    if (!form.terms) next.terms = "You must accept the terms to continue.";
    setErrors(next);
    if (Object.keys(next).length) return;

    const created = onCreated({
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      passwordHash: await hashPassword(form.password),
      accountType: form.accountType,
      university: form.university.trim(),
      verified: false,
      verificationToken: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      bio: "",
      techStack: [],
      experience: "Beginner",
      availability: "",
      github: "",
      onboardingComplete: false,
      onboardingSkipped: false,
    });
    if (!created) setErrors({ email: "An account with this email already exists." });
  };

  return (
    <div className="auth-page">
      <Header navigate={navigate} simple />
      <div className="auth-layout">
        <AuthAside />
        <main className="auth-main">
          <form className="auth-form" onSubmit={submit} noValidate>
            <span className="form-kicker">START YOUR JOURNEY</span>
            <h1>Create your account</h1>
            <p className="form-intro">Build your profile, find your people, and start creating.</p>

            <Field error={errors.name} label="Full name">
              <input autoComplete="name" onChange={(e) => update("name", e.target.value)} placeholder="e.g. Alex Morgan" value={form.name} />
            </Field>
            <Field error={errors.email} label="Email address">
              <input autoComplete="email" onChange={(e) => update("email", e.target.value)} placeholder="you@university.edu" type="email" value={form.email} />
            </Field>
            <div className="field-row">
              <Field error={errors.password} label="Password">
                <span className="input-wrap">
                  <input autoComplete="new-password" onChange={(e) => update("password", e.target.value)} placeholder="At least 8 characters" type={showPassword ? "text" : "password"} value={form.password} />
                  <button aria-label={showPassword ? "Hide password" : "Show password"} className="eye-button" onClick={() => setShowPassword((shown) => !shown)} type="button">
                    <Icon size={18}><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" stroke="currentColor" strokeWidth="1.6" /><circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.6" /></Icon>
                  </button>
                </span>
              </Field>
              <Field error={errors.confirmPassword} label="Confirm password">
                <input autoComplete="new-password" onChange={(e) => update("confirmPassword", e.target.value)} placeholder="Repeat password" type="password" value={form.confirmPassword} />
              </Field>
            </div>

            <fieldset className="account-type">
              <legend>I am a</legend>
              <div>
                {(["Student", "Staff"] as AccountType[]).map((type) => (
                  <label className={form.accountType === type ? "selected" : ""} key={type}>
                    <input checked={form.accountType === type} name="accountType" onChange={() => update("accountType", type)} type="radio" />
                    <span className="radio-dot" />
                    <span><strong>{type}</strong><small>{type === "Student" ? "Looking to build & learn" : "Supporting student talent"}</small></span>
                  </label>
                ))}
              </div>
            </fieldset>

            <Field error={errors.university} label="University name">
              <input onChange={(e) => update("university", e.target.value)} placeholder="Start typing your university" value={form.university} />
            </Field>

            <label className={`terms-check ${errors.terms ? "has-error" : ""}`}>
              <input checked={form.terms} onChange={(e) => update("terms", e.target.checked)} type="checkbox" />
              <span className="custom-check"><Icon size={13}><path d="m3 6.5 2 2L10 3.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></Icon></span>
              <span>I agree to the <button type="button">Terms of Service</button> and <button type="button">Privacy Policy</button>.</span>
            </label>
            {errors.terms && <p className="terms-error">{errors.terms}</p>}

            <button className="button button-coral submit-button" type="submit">Create my account <ArrowIcon /></button>
            <p className="auth-switch">Already part of the community? <button onClick={() => navigate("login")} type="button">Log in</button></p>
          </form>
        </main>
      </div>
    </div>
  );
}

function Verify({
  account,
  navigate,
  onVerify,
}: {
  account: Account | null;
  navigate: (view: View) => void;
  onVerify: () => void;
}) {
  const [resent, setResent] = useState(false);
  if (!account) {
    return <Login navigate={navigate} account={account} onLogin={() => undefined} />;
  }
  const verificationLink = `${window.location.origin}${window.location.pathname}#verify?token=${account.verificationToken}`;

  return (
    <div className="auth-page">
      <Header navigate={navigate} simple />
      <main className="verify-main">
        <div className="mail-illustration">
          <div className="mail-ring" />
          <Icon size={52}><path d="M3 6.5h18v12H3v-12Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.4" /><path d="m4 8 8 6 8-6" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.4" /></Icon>
          <span className="mail-spark spark-a" /><span className="mail-spark spark-b" />
        </div>
        <span className="form-kicker">ONE LAST STEP</span>
        <h1>Check your inbox</h1>
        <p>We sent a verification link to <strong>{account.email}</strong>. Click it to activate your Campus Connect account.</p>
        <a className="button button-coral verify-link" href={verificationLink} onClick={onVerify}>
          Open verification link <ArrowIcon />
        </a>
        <div className="verify-note">
          <Icon size={18}><path d="M12 8v4m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" stroke="currentColor" strokeLinecap="round" strokeWidth="1.6" /></Icon>
          This prototype shows the link here. In production it will only be sent by email.
        </div>
        <p className="resend">Didn’t receive it? <button onClick={() => setResent(true)} type="button">{resent ? "Link sent again" : "Resend verification email"}</button></p>
        <button className="text-button" onClick={() => navigate("login")} type="button">Return to log in</button>
      </main>
    </div>
  );
}

function Login({
  navigate,
  account,
  onLogin,
}: {
  navigate: (view: View) => void;
  account: Account | null;
  onLogin: (remember: boolean) => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const passwordHash = await hashPassword(password);
    if (!account || account.email !== email.trim().toLowerCase() || account.passwordHash !== passwordHash) {
      setError("The email or password you entered is incorrect.");
      return;
    }
    if (!account.verified) {
      setError("Please verify your email before logging in.");
      return;
    }
    onLogin(remember);
  };

  return (
    <div className="auth-page">
      <Header navigate={navigate} simple />
      <div className="auth-layout login-layout">
        <AuthAside />
        <main className="auth-main">
          <form className="auth-form login-form" onSubmit={submit}>
            <span className="form-kicker">WELCOME BACK</span>
            <h1>Log in to keep building</h1>
            <p className="form-intro">Your next collaboration is waiting.</p>
            {error && <div className="form-alert"><Icon size={18}><path d="M12 8v4m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" stroke="currentColor" strokeLinecap="round" strokeWidth="1.7" /></Icon>{error}</div>}
            <Field label="Email address">
              <input autoComplete="email" onChange={(e) => { setEmail(e.target.value); setError(""); }} placeholder="you@university.edu" type="email" value={email} />
            </Field>
            <Field label="Password">
              <input autoComplete="current-password" onChange={(e) => { setPassword(e.target.value); setError(""); }} placeholder="Your password" type="password" value={password} />
            </Field>
            <div className="login-options">
              <label className="remember-check">
                <input checked={remember} onChange={(e) => setRemember(e.target.checked)} type="checkbox" />
                <span className="custom-check"><Icon size={13}><path d="m3 6.5 2 2L10 3.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></Icon></span>
                Remember me
              </label>
              <button onClick={() => navigate("forgot")} type="button">Forgot password?</button>
            </div>
            <button className="button button-coral submit-button" type="submit">Log in <ArrowIcon /></button>
            {!account?.verified && account && <button className="resend-login" onClick={() => navigate("verify")} type="button">Resend verification link</button>}
            <p className="auth-switch">New to Campus Connect? <button onClick={() => navigate("signup")} type="button">Create an account</button></p>
          </form>
        </main>
      </div>
    </div>
  );
}

function Dashboard({ account, navigate }: { account: Account; navigate: (view: View) => void }) {
  const firstName = account.name.split(" ")[0];
  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <Logo onClick={() => navigate("home")} />
        <div className="dashboard-user"><span>{account.name.split(" ").map((part) => part[0]).slice(0, 2).join("")}</span><div><strong>{account.name}</strong><small>{account.accountType}</small></div></div>
      </header>
      <main>
        <span className="form-kicker">ACCOUNT VERIFIED</span>
        <h1>Welcome to Campus Connect, <em>{firstName}.</em></h1>
        <p>Your account is ready. Complete your profile next so we can match you with the right projects and people.</p>
        <div className="dashboard-card">
          <div className="progress-ring">25%</div>
          <div><span>YOUR NEXT STEP</span><h2>Set up your builder profile</h2><p>Add your skills, interests, and availability to start getting matched.</p></div>
          <button className="button button-dark" type="button">Complete profile <ArrowIcon /></button>
        </div>
      </main>
    </div>
  );
}

function ForgotPassword({
  account,
  navigate,
  onRequest,
}: {
  account: Account | null;
  navigate: (view: View) => void;
  onRequest: () => string | null;
}) {
  const [email, setEmail] = useState("");
  const [sentLink, setSentLink] = useState<string | null>(null);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const link = account?.email === email.trim().toLowerCase() ? onRequest() : null;
    setSentLink(link ?? "sent");
  };

  return (
    <div className="auth-page">
      <Header navigate={navigate} simple />
      <main className="recovery-main">
        <span className="recovery-icon">
          <Icon size={30}><path d="M4 10V8a8 8 0 0 1 15.5-2.7M20 14v2a8 8 0 0 1-15.5 2.7M3 4v5h5M21 20v-5h-5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" /></Icon>
        </span>
        <span className="form-kicker">ACCOUNT RECOVERY</span>
        <h1>Reset your password</h1>
        <p>Enter your account email and we’ll send a secure reset link that expires in 30 minutes.</p>
        {!sentLink ? (
          <form onSubmit={submit}>
            <Field label="Email address">
              <input autoFocus onChange={(e) => setEmail(e.target.value)} placeholder="you@university.edu" required type="email" value={email} />
            </Field>
            <button className="button button-coral submit-button" type="submit">Send reset link <ArrowIcon /></button>
          </form>
        ) : (
          <div className="recovery-sent">
            <strong>Check your inbox</strong>
            <p>If an account exists for that email, a reset link has been sent.</p>
            {sentLink !== "sent" && <a className="button button-dark" href={sentLink}>Open prototype reset link</a>}
          </div>
        )}
        <button className="text-button recovery-back" onClick={() => navigate("login")} type="button">Back to login</button>
      </main>
    </div>
  );
}

function ResetPassword({
  account,
  navigate,
  onReset,
}: {
  account: Account | null;
  navigate: (view: View) => void;
  onReset: (passwordHash: string) => void;
}) {
  const params = new URLSearchParams(window.location.hash.split("?")[1] ?? "");
  const token = params.get("token");
  const valid = Boolean(account && token && account.resetToken === token && (account.resetExpiresAt ?? 0) > Date.now());
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (password.length < 8) return setError("Use at least 8 characters.");
    if (password !== confirm) return setError("Passwords do not match.");
    onReset(await hashPassword(password));
    setDone(true);
  };

  return (
    <div className="auth-page">
      <Header navigate={navigate} simple />
      <main className="recovery-main">
        <span className="form-kicker">SECURE RESET</span>
        <h1>{done ? "Password updated" : valid ? "Choose a new password" : "This link has expired"}</h1>
        {done ? (
          <div className="recovery-sent"><p>Your password was changed successfully. You can now log in.</p><button className="button button-coral" onClick={() => navigate("login")} type="button">Continue to login</button></div>
        ) : valid ? (
          <form onSubmit={submit}>
            {error && <div className="form-alert">{error}</div>}
            <Field label="New password"><input autoFocus onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" type="password" value={password} /></Field>
            <Field label="Confirm new password"><input onChange={(e) => setConfirm(e.target.value)} placeholder="Repeat new password" type="password" value={confirm} /></Field>
            <button className="button button-coral submit-button" type="submit">Update password <ArrowIcon /></button>
          </form>
        ) : (
          <div className="recovery-sent"><p>Reset links are valid for 30 minutes and can only be used once.</p><button className="button button-dark" onClick={() => navigate("forgot")} type="button">Request a new link</button></div>
        )}
      </main>
    </div>
  );
}

const POPULAR_SKILLS = ["React", "TypeScript", "Python", "Node.js", "Figma", "Java", "Flutter", "Machine Learning"];

function Onboarding({
  account,
  onSave,
  onSkip,
}: {
  account: Account;
  onSave: (profile: Partial<Account>) => void;
  onSkip: () => void;
}) {
  const [bio, setBio] = useState(account.bio);
  const [skills, setSkills] = useState<string[]>(account.techStack);
  const [experience, setExperience] = useState<Experience>(account.experience);
  const [availability, setAvailability] = useState(account.availability);
  const [github, setGithub] = useState(account.github);

  const toggleSkill = (skill: string) => setSkills((current) => current.includes(skill) ? current.filter((item) => item !== skill) : [...current, skill]);
  const submit = (event: FormEvent) => {
    event.preventDefault();
    onSave({ bio, techStack: skills, experience, availability, github, onboardingComplete: true, onboardingSkipped: false });
  };

  return (
    <div className="onboarding-page">
      <header><Logo onClick={() => undefined} /><span>Step 1 of 1</span></header>
      <main>
        <div className="onboarding-heading">
          <span className="form-kicker">MAKE IT YOURS</span>
          <h1>Tell us how you like to <em>build.</em></h1>
          <p>This helps us recommend the right projects, teammates, and opportunities.</p>
        </div>
        <form className="profile-form" onSubmit={submit}>
          <Field label="Short bio">
            <textarea maxLength={240} onChange={(e) => setBio(e.target.value)} placeholder="What are you curious about? What do you want to build?" value={bio} />
          </Field>
          <fieldset className="skills-field">
            <legend>Tech stack <span>Select all that apply</span></legend>
            <div>{POPULAR_SKILLS.map((skill) => <button className={skills.includes(skill) ? "selected" : ""} key={skill} onClick={() => toggleSkill(skill)} type="button">{skill}{skills.includes(skill) && " ×"}</button>)}</div>
          </fieldset>
          <div className="field-row">
            <label className="field"><span>Experience level</span><select onChange={(e) => setExperience(e.target.value as Experience)} value={experience}><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></label>
            <label className="field"><span>Availability</span><select onChange={(e) => setAvailability(e.target.value)} value={availability}><option value="">Select availability</option><option>1–5 hours / week</option><option>6–10 hours / week</option><option>10+ hours / week</option></select></label>
          </div>
          <Field label="GitHub profile (optional)"><input onChange={(e) => setGithub(e.target.value)} placeholder="https://github.com/username" type="url" value={github} /></Field>
          <div className="onboarding-actions"><button className="text-button" onClick={onSkip} type="button">Skip for now</button><button className="button button-coral" type="submit">Save and continue <ArrowIcon /></button></div>
        </form>
      </main>
    </div>
  );
}

function AppShell({
  account,
  view,
  navigate,
  onLogout,
  onSave,
  projects,
  notices,
  onCreateProject,
  onJoinProject,
  onRequestDecision,
  onReadNotices,
  savedItems,
  onToggleSaved,
}: {
  account: Account;
  view: View;
  navigate: (view: View) => void;
  onLogout: () => void;
  onSave: (profile: Partial<Account>) => void;
  projects: Project[];
  notices: Notice[];
  onCreateProject: (project: Project) => void;
  onJoinProject: (projectId: string, message: string) => void;
  onRequestDecision: (projectId: string, requestId: string, decision: "accepted" | "declined") => void;
  onReadNotices: () => void;
  savedItems: SavedItem[];
  onToggleSaved: (item: SavedItem) => void;
}) {
  const firstName = account.name.split(" ")[0];
  const initials = account.name.split(" ").map((part) => part[0]).slice(0, 2).join("");
  const unreadCount = notices.filter((notice) => !notice.read).length;
  const nav: { label: string; view: View }[] = [
    { label: "Dashboard", view: "dashboard" },
    { label: "Projects", view: "projects" },
    { label: "My Projects", view: "my-projects" },
    { label: "Internships", view: "internships" },
    { label: "Mentors", view: "mentors" },
    { label: "Courses", view: "courses" },
    { label: "People", view: "people" },
    { label: "Saved", view: "saved" },
    { label: "Profile", view: "profile" },
    { label: unreadCount ? `Notifications (${unreadCount})` : "Notifications", view: "notifications" },
  ];
  if (account.accountType === "Staff") nav.splice(3, 0, { label: "Talent", view: "projects" });
  if (account.accountType === "Admin") nav.splice(3, 0, { label: "Admin", view: "projects" });

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <Logo onClick={() => navigate("dashboard")} />
        <nav>{nav.map((item, index) => <button className={view === item.view ? "active" : ""} key={`${item.label}-${index}`} onClick={() => navigate(item.view)} type="button"><span>{item.label.slice(0, 1)}</span>{item.label}</button>)}</nav>
        <button className="logout-button" onClick={onLogout} type="button"><Icon size={17}><path d="M10 17l5-5-5-5M15 12H3M15 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" /></Icon>Log out</button>
      </aside>
      <div className="app-content">
        <header className="app-topbar"><div><span className="status-dot" />Campus community online</div><button onClick={() => navigate("profile")} type="button"><span>{initials}</span><div><strong>{account.name}</strong><small>{account.accountType}</small></div></button></header>
        <main>
          {account.onboardingSkipped && !account.onboardingComplete && <div className="profile-reminder"><span>Complete your profile to improve project matches.</span><button onClick={() => navigate("onboarding")} type="button">Finish setup</button></div>}
          {view === "profile" ? <Profile account={account} onSave={onSave} /> : view === "projects" ? (
            <ProjectsHub account={account} onCreate={onCreateProject} onDecision={onRequestDecision} onJoin={onJoinProject} onToggleSaved={onToggleSaved} projects={projects} savedItems={savedItems} />
          ) : view === "my-projects" ? <MyProjects account={account} navigate={navigate} projects={projects} /> : view === "internships" ? <InternshipsPage canPost={account.accountType !== "Student"} onToggleSaved={onToggleSaved} savedItems={savedItems} /> : view === "mentors" ? <MentorsPage onToggleSaved={onToggleSaved} savedItems={savedItems} /> : view === "courses" ? <CoursesPage onToggleSaved={onToggleSaved} savedItems={savedItems} /> : view === "people" ? <PeoplePage account={account} /> : view === "saved" ? <SavedPage items={savedItems} onToggleSaved={onToggleSaved} /> : view === "notifications" ? (
            <NotificationsPage notices={notices} onRead={onReadNotices} />
          ) : view === "dashboard" ? (
            <>
              <div className="app-heading"><span className="form-kicker">YOUR CAMPUS</span><h1>Good to see you, <em>{firstName}.</em></h1><p>Here’s what’s happening in your builder community.</p></div>
              <div className="quick-grid"><article><span>OPEN PROJECTS</span><strong>0</strong><p>Find a team and start building.</p><button onClick={() => navigate("projects")} type="button">Explore projects <ArrowIcon /></button></article><article><span>INTERNSHIP MATCHES</span><strong>0</strong><p>Opportunities matching your profile.</p><button onClick={() => navigate("internships")} type="button">Browse internships <ArrowIcon /></button></article><article><span>NOTIFICATIONS</span><strong>0</strong><p>You’re all caught up for now.</p><button onClick={() => navigate("notifications")} type="button">View activity <ArrowIcon /></button></article></div>
              <section className="empty-feed"><span className="empty-mark">CC</span><h2>Your next collaboration starts here</h2><p>Projects and updates from your community will appear here.</p><button className="button button-dark" onClick={() => navigate("projects")} type="button">Discover projects</button></section>
            </>
          ) : <PlaceholderPage view={view} />}
        </main>
      </div>
    </div>
  );
}

function ProjectsHub({
  account,
  projects,
  onCreate,
  onJoin,
  onDecision,
  savedItems,
  onToggleSaved,
}: {
  account: Account;
  projects: Project[];
  onCreate: (project: Project) => void;
  onJoin: (projectId: string, message: string) => void;
  onDecision: (projectId: string, requestId: string, decision: "accepted" | "declined") => void;
  savedItems: SavedItem[];
  onToggleSaved: (item: SavedItem) => void;
}) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [category, setCategory] = useState("All");
  const [skill, setSkill] = useState("All");
  const [showCreate, setShowCreate] = useState(false);
  const [joinProject, setJoinProject] = useState<Project | null>(null);
  const [detailProjectId, setDetailProjectId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [created, setCreated] = useState({ title: "", description: "", category: "EdTech", tech: "", roles: "", teamSize: "4", status: "Open" as Project["status"] });
  const categories = ["All", ...Array.from(new Set(projects.map((project) => project.category)))];
  const skills = ["All", ...Array.from(new Set(projects.flatMap((project) => project.techStack)))];
  const filtered = projects.filter((project) => {
    const term = search.toLowerCase();
    return (!term || `${project.title} ${project.description}`.toLowerCase().includes(term))
      && (status === "All" || project.status === status)
      && (category === "All" || project.category === category)
      && (skill === "All" || project.techStack.includes(skill));
  });
  const submitProject = (event: FormEvent) => {
    event.preventDefault();
    const techStack = created.tech.split(",").map((item) => item.trim()).filter(Boolean);
    const roles = created.roles.split(",").map((item) => item.trim()).filter(Boolean);
    if (!created.title.trim() || !created.description.trim() || !techStack.length || !roles.length) return;
    onCreate({
      id: crypto.randomUUID(),
      title: created.title.trim(),
      description: created.description.trim(),
      category: created.category,
      techStack,
      roles,
      teamSize: Number(created.teamSize),
      status: created.status,
      ownerEmail: account.email,
      ownerName: account.name,
      members: [account.name],
      requests: [],
    });
    setCreated({ title: "", description: "", category: "EdTech", tech: "", roles: "", teamSize: "4", status: "Open" });
    setShowCreate(false);
  };
  const submitJoin = (event: FormEvent) => {
    event.preventDefault();
    if (!joinProject || !message.trim()) return;
    onJoin(joinProject.id, message.trim());
    setJoinProject(null);
    setMessage("");
  };

  const detailProject = projects.find((project) => project.id === detailProjectId);
  if (detailProject) {
    const matched = detailProject.techStack.filter((item) => account.techStack.some((skillName) => skillName.toLowerCase() === item.toLowerCase()));
    const missing = detailProject.techStack.filter((item) => !matched.includes(item));
    const score = Math.round((matched.length / Math.max(detailProject.techStack.length, 1)) * 100);
    const ownProject = detailProject.ownerEmail === account.email;
    const request = detailProject.requests.find((item) => item.applicantEmail === account.email);
    return (
      <div className="project-detail">
        <button className="detail-back" onClick={() => setDetailProjectId(null)} type="button">← Back to projects</button>
        <div className="detail-hero">
          <div><span className={`status-badge ${detailProject.status.toLowerCase().replace(" ", "-")}`}>{detailProject.status}</span><span className="detail-category">{detailProject.category}</span><h1>{detailProject.title}</h1><p>{detailProject.description}</p><div className="listing-tags">{detailProject.techStack.map((item) => <span key={item}>{item}</span>)}</div></div>
          <div className="detail-actions"><button aria-label="Save project" className={`save-button ${savedItems.some((item) => item.id === detailProject.id) ? "saved" : ""}`} onClick={() => onToggleSaved({ id: detailProject.id, type: "Project", title: detailProject.title, subtitle: detailProject.category })} type="button">Save</button>{!ownProject && !request && <button className="button button-coral" onClick={() => setJoinProject(detailProject)} type="button">Request to join</button>}{request && <span className={`request-state ${request.status}`}>Request {request.status}</span>}</div>
        </div>
        <div className="detail-layout">
          <section><span className="form-kicker">PROJECT BRIEF</span><h2>What the team is building</h2><p>{detailProject.description} The team is looking for thoughtful collaborators who enjoy learning in public, sharing feedback, and turning early ideas into a useful working product.</p><h3>Roles currently needed</h3><div className="role-cards">{detailProject.roles.map((role) => <div key={role}><span>{role.slice(0, 1)}</span><strong>{role}</strong><small>Open role</small></div>)}</div><h3>Current team</h3><div className="team-row">{detailProject.members.map((member) => <span key={member}><b>{member.split(" ").map((part) => part[0]).slice(0, 2).join("")}</b>{member}</span>)}</div></section>
          <aside className="match-card"><span className="form-kicker">YOUR MATCH</span><strong>{score}%</strong><h3>{score >= 65 ? "Strong skill match" : "Room to grow"}</h3><p>{matched.length ? `You already bring ${matched.join(", ")}.` : "Add more skills to your profile to improve this match."}</p>{missing.length > 0 && <div><small>SKILLS TO LEARN</small>{missing.map((item) => <span key={item}>{item}</span>)}</div>}<button onClick={() => setDetailProjectId(null)} type="button">Find related projects</button></aside>
        </div>
        {joinProject && <div className="dialog-backdrop" onMouseDown={() => setJoinProject(null)}><form className="join-dialog" onMouseDown={(e) => e.stopPropagation()} onSubmit={submitJoin}><span className="form-kicker">JOIN {joinProject.title.toUpperCase()}</span><h2>Tell the team why you’d like to help.</h2><Field label="Short message"><textarea autoFocus onChange={(e) => setMessage(e.target.value)} placeholder="Introduce yourself and share how your skills could contribute..." required value={message} /></Field><div><button className="text-button" onClick={() => setJoinProject(null)} type="button">Cancel</button><button className="button button-coral" type="submit">Send request</button></div></form></div>}
      </div>
    );
  }

  return (
    <div className="projects-page">
      <div className="marketplace-heading">
        <div><span className="form-kicker">BUILD TOGETHER</span><h1>Discover projects</h1><p>Find an idea that matches your skills—or start one of your own.</p></div>
        <button className="button button-coral" onClick={() => setShowCreate((shown) => !shown)} type="button">{showCreate ? "Close form" : "Post a project"}</button>
      </div>

      {showCreate && (
        <form className="create-panel" onSubmit={submitProject}>
          <div className="panel-title"><div><span>NEW PROJECT</span><h2>Share your idea</h2></div><p>Give future teammates enough detail to know where they can contribute.</p></div>
          <div className="field-row"><Field label="Project title"><input onChange={(e) => setCreated({ ...created, title: e.target.value })} placeholder="e.g. Campus Food Rescue" required value={created.title} /></Field><label className="field"><span>Category</span><select onChange={(e) => setCreated({ ...created, category: e.target.value })} value={created.category}><option>EdTech</option><option>Climate</option><option>Health</option><option>Social impact</option><option>Developer tools</option></select></label></div>
          <Field label="Description"><textarea onChange={(e) => setCreated({ ...created, description: e.target.value })} placeholder="What are you building, and why does it matter?" required value={created.description} /></Field>
          <div className="field-row"><Field label="Tech stack tags"><input onChange={(e) => setCreated({ ...created, tech: e.target.value })} placeholder="React, Python, Figma" required value={created.tech} /></Field><Field label="Roles needed"><input onChange={(e) => setCreated({ ...created, roles: e.target.value })} placeholder="Designer, Backend developer" required value={created.roles} /></Field></div>
          <div className="field-row"><label className="field"><span>Team size</span><select onChange={(e) => setCreated({ ...created, teamSize: e.target.value })} value={created.teamSize}>{[2,3,4,5,6,8,10].map((size) => <option key={size}>{size}</option>)}</select></label><label className="field"><span>Status</span><select onChange={(e) => setCreated({ ...created, status: e.target.value as Project["status"] })} value={created.status}><option>Open</option><option>In progress</option><option>Completed</option></select></label></div>
          <button className="button button-dark" type="submit">Publish project <ArrowIcon /></button>
        </form>
      )}

      <div className="project-filters">
        <label className="search-field"><Icon size={17}><circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.7" /><path d="m16 16 4 4" stroke="currentColor" strokeLinecap="round" strokeWidth="1.7" /></Icon><input onChange={(e) => setSearch(e.target.value)} placeholder="Search projects" value={search} /></label>
        <select aria-label="Filter by status" onChange={(e) => setStatus(e.target.value)} value={status}><option>All</option><option>Open</option><option>In progress</option><option>Completed</option></select>
        <select aria-label="Filter by category" onChange={(e) => setCategory(e.target.value)} value={category}>{categories.map((item) => <option key={item}>{item}</option>)}</select>
        <select aria-label="Filter by skill" onChange={(e) => setSkill(e.target.value)} value={skill}>{skills.map((item) => <option key={item}>{item}</option>)}</select>
      </div>

      <div className="results-meta"><span>{filtered.length} projects</span><span>Updated just now</span></div>
      <div className="project-grid">
        {filtered.map((project) => {
          const matched = project.techStack.filter((item) => account.techStack.some((skillName) => skillName.toLowerCase() === item.toLowerCase()));
          const ownProject = project.ownerEmail === account.email;
          const existingRequest = project.requests.find((request) => request.applicantEmail === account.email);
          return (
            <article className="project-listing" key={project.id}>
              <div className="listing-top"><span className={`status-badge ${project.status.toLowerCase().replace(" ", "-")}`}>{project.status}</span><button aria-label={`Save ${project.title}`} className={`card-save ${savedItems.some((item) => item.id === project.id) ? "saved" : ""}`} onClick={() => onToggleSaved({ id: project.id, type: "Project", title: project.title, subtitle: project.category })} type="button">{savedItems.some((item) => item.id === project.id) ? "Saved" : "Save"}</button></div>
              <button className="listing-title" onClick={() => setDetailProjectId(project.id)} type="button">{project.title}</button>
              <p>{project.description}</p>
              {matched.length > 0 && <div className="skill-match"><Icon size={14}><path d="m12 3 1.2 3.7a2 2 0 0 0 1.3 1.3l3.7 1.2-3.7 1.3a2 2 0 0 0-1.3 1.2L12 15.5l-1.2-3.8a2 2 0 0 0-1.3-1.2L5.7 9.2 9.5 8a2 2 0 0 0 1.3-1.3L12 3Z" fill="currentColor" /></Icon>Matches {matched.join(" + ")}</div>}
              <div className="listing-tags">{project.techStack.map((item) => <span key={item}>{item}</span>)}</div>
              <div className="roles-needed"><small>LOOKING FOR</small><p>{project.roles.join(" · ")}</p></div>
              <div className="listing-footer"><div><strong>{project.ownerName}</strong><small>{project.members.length} of {project.teamSize} members</small></div>{ownProject ? <span className="owner-label">Your project</span> : existingRequest ? <span className={`request-state ${existingRequest.status}`}>{existingRequest.status}</span> : <button disabled={project.status !== "Open"} onClick={() => setJoinProject(project)} type="button">Request to join</button>}</div>
              {ownProject && project.requests.length > 0 && <div className="request-list"><strong>JOIN REQUESTS</strong>{project.requests.map((request) => <div key={request.id}><span>{request.applicantName}<small>{request.message}</small></span>{request.status === "pending" ? <span><button onClick={() => onDecision(project.id, request.id, "declined")} type="button">Decline</button><button onClick={() => onDecision(project.id, request.id, "accepted")} type="button">Accept</button></span> : <b>{request.status}</b>}</div>)}</div>}
            </article>
          );
        })}
      </div>
      {joinProject && <div className="dialog-backdrop" onMouseDown={() => setJoinProject(null)}><form className="join-dialog" onMouseDown={(e) => e.stopPropagation()} onSubmit={submitJoin}><span className="form-kicker">JOIN {joinProject.title.toUpperCase()}</span><h2>Tell the team why you’d like to help.</h2><Field label="Short message"><textarea autoFocus onChange={(e) => setMessage(e.target.value)} placeholder="Introduce yourself and share how your skills could contribute..." required value={message} /></Field><div><button className="text-button" onClick={() => setJoinProject(null)} type="button">Cancel</button><button className="button button-coral" type="submit">Send request</button></div></form></div>}
    </div>
  );
}

type Internship = { id: string; title: string; company: string; location: string; skills: string[]; applyUrl: string };

function InternshipsPage({ canPost, savedItems, onToggleSaved }: { canPost: boolean; savedItems: SavedItem[]; onToggleSaved: (item: SavedItem) => void }) {
  const [listings, setListings] = useState<Internship[]>(() => {
    try {
      const stored = localStorage.getItem("campus-connect-internships");
      return stored ? JSON.parse(stored) : [
        { id: "1", title: "Software Engineering Intern", company: "Northstar Labs", location: "Remote", skills: ["React", "TypeScript"], applyUrl: "https://www.linkedin.com/jobs/" },
        { id: "2", title: "Data & AI Intern", company: "CivicWorks", location: "Hybrid · London", skills: ["Python", "Machine Learning"], applyUrl: "https://www.linkedin.com/jobs/" },
      ];
    } catch { return []; }
  });
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState({ title: "", company: "", location: "", skills: "", applyUrl: "" });
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const next = [...listings, { id: crypto.randomUUID(), ...draft, skills: draft.skills.split(",").map((item) => item.trim()).filter(Boolean) }];
    setListings(next);
    localStorage.setItem("campus-connect-internships", JSON.stringify(next));
    setShowForm(false);
    setDraft({ title: "", company: "", location: "", skills: "", applyUrl: "" });
  };
  return (
    <div className="opportunity-page">
      <div className="marketplace-heading"><div><span className="form-kicker">CAREER LAUNCHPAD</span><h1>Internships</h1><p>Early-career opportunities shared by trusted campus partners.</p></div>{canPost && <button className="button button-coral" onClick={() => setShowForm((shown) => !shown)} type="button">{showForm ? "Close form" : "Post opportunity"}</button>}</div>
      {showForm && <form className="create-panel compact" onSubmit={submit}><div className="field-row"><Field label="Role title"><input required value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} /></Field><Field label="Company"><input required value={draft.company} onChange={(e) => setDraft({ ...draft, company: e.target.value })} /></Field></div><div className="field-row"><Field label="Location"><input required value={draft.location} onChange={(e) => setDraft({ ...draft, location: e.target.value })} /></Field><Field label="Skills"><input placeholder="React, Figma" required value={draft.skills} onChange={(e) => setDraft({ ...draft, skills: e.target.value })} /></Field></div><Field label="External apply link"><input required type="url" value={draft.applyUrl} onChange={(e) => setDraft({ ...draft, applyUrl: e.target.value })} /></Field><button className="button button-dark" type="submit">Publish opportunity</button></form>}
      <div className="internship-list">{listings.map((listing) => <article key={listing.id}><div className="company-mark">{listing.company.slice(0, 2).toUpperCase()}</div><div><span>{listing.company}</span><h2>{listing.title}</h2><p>{listing.location}</p><div className="listing-tags">{listing.skills.map((item) => <span key={item}>{item}</span>)}</div></div><div className="internship-actions"><button className={`save-button ${savedItems.some((item) => item.id === listing.id) ? "saved" : ""}`} onClick={() => onToggleSaved({ id: listing.id, type: "Internship", title: listing.title, subtitle: listing.company })} type="button">Save</button><a className="button button-dark" href={listing.applyUrl} rel="noreferrer" target="_blank">Apply externally <ArrowIcon /></a></div></article>)}</div>
    </div>
  );
}

function MentorsPage({ savedItems, onToggleSaved }: { savedItems: SavedItem[]; onToggleSaved: (item: SavedItem) => void }) {
  const mentors = [
    { name: "Dr. Elena Vasquez", role: "AI Researcher · University Staff", skills: ["Machine Learning", "Python"], initials: "EV" },
    { name: "Marcus Adeyemi", role: "Product Engineer · Alumni", skills: ["React", "Career advice"], initials: "MA" },
    { name: "Priya Nair", role: "UX Lead · Industry Mentor", skills: ["Figma", "Product design"], initials: "PN" },
  ];
  const [contacted, setContacted] = useState<string[]>([]);
  return <div className="opportunity-page"><div className="marketplace-heading"><div><span className="form-kicker">LEARN FROM EXPERIENCE</span><h1>Find a mentor</h1><p>Connect with people who can offer guidance on skills, projects, and your next career step.</p></div></div><div className="mentor-grid">{mentors.map((mentor) => <article key={mentor.name}><button className={`card-save ${savedItems.some((item) => item.id === mentor.name) ? "saved" : ""}`} onClick={() => onToggleSaved({ id: mentor.name, type: "Mentor", title: mentor.name, subtitle: mentor.role })} type="button">Save</button><div className="mentor-avatar">{mentor.initials}</div><h2>{mentor.name}</h2><p>{mentor.role}</p><div className="listing-tags">{mentor.skills.map((skill) => <span key={skill}>{skill}</span>)}</div><button className="button button-ghost" onClick={() => setContacted((current) => current.includes(mentor.name) ? current : [...current, mentor.name])} type="button">{contacted.includes(mentor.name) ? "Interest sent" : "Connect with mentor"}</button></article>)}</div><div className="phase-note">Full mentor matching and scheduling will become available in the teamwork and growth phase.</div></div>;
}

function CoursesPage({ savedItems, onToggleSaved }: { savedItems: SavedItem[]; onToggleSaved: (item: SavedItem) => void }) {
  const courses = [
    { id: "react-foundations", title: "React Foundations", provider: "Campus Connect Learning", level: "Beginner", skills: ["React", "TypeScript"] },
    { id: "product-design", title: "Designing Products People Use", provider: "Open Design School", level: "Intermediate", skills: ["Figma", "Product design"] },
    { id: "python-data", title: "Applied Python for Data", provider: "Future Skills Lab", level: "Beginner", skills: ["Python", "Data"] },
  ];
  const [enrolled, setEnrolled] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem("campus-connect-courses") ?? "[]"); } catch { return []; }
  });
  const toggleEnrollment = (courseId: string) => {
    const next = enrolled.includes(courseId) ? enrolled.filter((id) => id !== courseId) : [...enrolled, courseId];
    setEnrolled(next);
    localStorage.setItem("campus-connect-courses", JSON.stringify(next));
  };
  return <div className="opportunity-page"><div className="marketplace-heading"><div><span className="form-kicker">LEARN, THEN BUILD</span><h1>Courses</h1><p>Build a skill, then put it into practice on a real student project.</p></div></div><div className="course-grid">{courses.map((course, index) => <article key={course.title}><button className={`card-save course-save ${savedItems.some((item) => item.id === course.id) ? "saved" : ""}`} onClick={() => onToggleSaved({ id: course.id, type: "Course", title: course.title, subtitle: course.provider })} type="button">Save</button><div className={`course-cover cover-${index + 1}`}><span>0{index + 1}</span><small>{course.level}</small></div><div><span>{course.provider}</span><h2>{course.title}</h2><div className="listing-tags">{course.skills.map((skill) => <span key={skill}>{skill}</span>)}</div><button className={enrolled.includes(course.id) ? "enrolled" : ""} onClick={() => toggleEnrollment(course.id)} type="button">{enrolled.includes(course.id) ? "Enrolled · Leave course" : "Enroll in course"} <ArrowIcon /></button></div></article>)}</div></div>;
}

function MyProjects({ account, projects, navigate }: { account: Account; projects: Project[]; navigate: (view: View) => void }) {
  const owned = projects.filter((project) => project.ownerEmail === account.email);
  const joined = projects.filter((project) => project.members.includes(account.name) && project.ownerEmail !== account.email);
  const requested = projects.filter((project) => project.requests.some((request) => request.applicantEmail === account.email && request.status === "pending"));
  const groups: { title: string; detail: string; items: Project[] }[] = [
    { title: "Projects I own", detail: "Ideas you started and teams you manage.", items: owned },
    { title: "Teams I joined", detail: "Projects where you are an accepted team member.", items: joined },
    { title: "Pending requests", detail: "Teams you are waiting to hear back from.", items: requested },
  ];
  return <div className="my-projects-page"><div className="marketplace-heading"><div><span className="form-kicker">YOUR WORK</span><h1>My Projects</h1><p>Everything you’re building and every team you’re connecting with.</p></div><button className="button button-coral" onClick={() => navigate("projects")} type="button">Find more projects</button></div><div className="project-summary"><div><strong>{owned.length}</strong><span>Owned</span></div><div><strong>{joined.length}</strong><span>Joined</span></div><div><strong>{requested.length}</strong><span>Pending</span></div></div>{groups.map((group) => <section className="project-group" key={group.title}><div><h2>{group.title}</h2><p>{group.detail}</p></div>{group.items.length ? <div className="mini-project-grid">{group.items.map((project) => <article key={project.id}><span className={`status-badge ${project.status.toLowerCase().replace(" ", "-")}`}>{project.status}</span><h3>{project.title}</h3><p>{project.category} · {project.members.length}/{project.teamSize} members</p><div className="listing-tags">{project.techStack.slice(0, 3).map((skill) => <span key={skill}>{skill}</span>)}</div></article>)}</div> : <div className="group-empty">No projects in this section yet.</div>}</section>)}</div>;
}

function SavedPage({ items, onToggleSaved }: { items: SavedItem[]; onToggleSaved: (item: SavedItem) => void }) {
  const [filter, setFilter] = useState("All");
  const filtered = filter === "All" ? items : items.filter((item) => item.type === filter);
  return <div className="saved-page"><div className="marketplace-heading"><div><span className="form-kicker">YOUR SHORTLIST</span><h1>Saved opportunities</h1><p>Projects, people, learning, and roles you want to revisit.</p></div></div><div className="saved-filters">{["All", "Project", "Internship", "Mentor", "Course"].map((type) => <button className={filter === type ? "active" : ""} key={type} onClick={() => setFilter(type)} type="button">{type}</button>)}</div>{filtered.length ? <div className="saved-grid">{filtered.map((item) => <article key={`${item.type}-${item.id}`}><span>{item.type}</span><h2>{item.title}</h2><p>{item.subtitle}</p><button onClick={() => onToggleSaved(item)} type="button">Remove from saved</button></article>)}</div> : <div className="empty-feed"><span className="empty-mark">S</span><h2>Nothing saved here yet</h2><p>Save opportunities while browsing and they’ll appear here.</p></div>}</div>;
}

function PeoplePage({ account }: { account: Account }) {
  const [selected, setSelected] = useState<string | null>(null);
  const people = [
    { name: "Maya Chen", role: "Student", university: "National University of Singapore", bio: "Frontend developer exploring tools that make learning more collaborative.", skills: ["React", "TypeScript", "Figma"], availability: "6–10 hours / week", projects: 3 },
    { name: "Samuel Okoro", role: "Student", university: "University of Lagos", bio: "Backend developer interested in climate technology and open-source communities.", skills: ["Python", "Node.js", "Machine Learning"], availability: "10+ hours / week", projects: 2 },
    { name: "Nora James", role: "Staff", university: "University of Edinburgh", bio: "Supporting emerging technologists with product strategy and research mentorship.", skills: ["Product design", "Figma", "Career advice"], availability: "1–5 hours / week", projects: 5 },
  ];
  const person = people.find((item) => item.name === selected);
  if (person) return <div className="public-profile"><button className="detail-back" onClick={() => setSelected(null)} type="button">← Back to people</button><div className="public-profile-hero"><div className="large-avatar">{person.name.split(" ").map((part) => part[0]).join("")}</div><div><span>{person.role} · {person.university}</span><h1>{person.name}</h1><p>{person.bio}</p></div><button className="button button-coral" type="button">Invite to project</button></div><div className="public-profile-grid"><section><span className="form-kicker">SKILLS & INTERESTS</span><div className="profile-skills">{person.skills.map((skill) => <span className={account.techStack.includes(skill) ? "match" : ""} key={skill}>{skill}</span>)}</div></section><section><span className="form-kicker">COLLABORATION</span><strong>{person.availability}</strong><p>Current availability</p></section><section><span className="form-kicker">PROJECTS</span><strong>{person.projects}</strong><p>Projects contributed to</p></section></div></div>;
  return <div className="people-page"><div className="marketplace-heading"><div><span className="form-kicker">MEET YOUR COMMUNITY</span><h1>Student builders</h1><p>Find collaborators with complementary skills and shared interests.</p></div></div><div className="people-grid">{people.map((person) => { const overlap = person.skills.filter((skill) => account.techStack.includes(skill)); return <article key={person.name}><div className="mentor-avatar">{person.name.split(" ").map((part) => part[0]).join("")}</div><span>{person.role} · {person.university}</span><h2>{person.name}</h2><p>{person.bio}</p>{overlap.length > 0 && <div className="skill-match">{overlap.length} shared skill{overlap.length > 1 ? "s" : ""}</div>}<div className="listing-tags">{person.skills.map((skill) => <span key={skill}>{skill}</span>)}</div><button className="button button-ghost" onClick={() => setSelected(person.name)} type="button">View profile</button></article>; })}</div></div>;
}

function NotificationsPage({ notices, onRead }: { notices: Notice[]; onRead: () => void }) {
  useEffect(() => onRead(), []);
  return <div className="opportunity-page"><div className="marketplace-heading"><div><span className="form-kicker">STAY IN THE LOOP</span><h1>Notifications</h1><p>Join requests, team decisions, and opportunity updates in one place.</p></div></div><div className="notification-list">{notices.length ? notices.map((notice) => <article className={notice.read ? "" : "unread"} key={notice.id}><span className="notice-dot" /><div><h2>{notice.title}</h2><p>{notice.detail}</p><small>{new Date(notice.createdAt).toLocaleString()}</small></div></article>) : <div className="empty-feed"><span className="empty-mark">N</span><h2>You’re all caught up</h2><p>New join requests and decisions will appear here.</p></div>}</div></div>;
}

function PlaceholderPage({ view }: { view: View }) {
  const content: Record<string, [string, string]> = {
    projects: ["Projects", "Discover student-led ideas, find a skill match, and request to join a build."],
    internships: ["Internships", "Relevant internship opportunities will appear here as partners join the platform."],
    notifications: ["Notifications", "Project invitations, join requests, and account updates will appear here."],
  };
  const [title, description] = content[view] ?? ["Coming soon", "This space is being prepared for the community."];
  return <div className="placeholder-page"><span className="form-kicker">CAMPUS CONNECT</span><h1>{title}</h1><p>{description}</p><div><span className="empty-mark">{title.slice(0, 2).toUpperCase()}</span><h2>Nothing here yet</h2><p>Check back as your community grows.</p></div></div>;
}

function Profile({ account, onSave }: { account: Account; onSave: (profile: Partial<Account>) => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(account);
  const toggleSkill = (skill: string) => setDraft((current) => ({ ...current, techStack: current.techStack.includes(skill) ? current.techStack.filter((item) => item !== skill) : [...current.techStack, skill] }));
  const save = (event: FormEvent) => {
    event.preventDefault();
    onSave(draft);
    setEditing(false);
  };

  return (
    <div className="profile-page">
      <div className="profile-title"><div><span className="form-kicker">YOUR BUILDER IDENTITY</span><h1>Profile</h1><p>Keep your details current so people can find the right collaborator.</p></div>{!editing && <button className="button button-dark" onClick={() => setEditing(true)} type="button">Edit profile</button>}</div>
      <form className="profile-card" onSubmit={save}>
        <div className="profile-avatar">{account.name.split(" ").map((part) => part[0]).slice(0, 2).join("")}</div>
        <div className="profile-fields">
          <div className="field-row"><Field label="Full name"><input disabled={!editing} onChange={(e) => setDraft({ ...draft, name: e.target.value })} value={draft.name} /></Field><Field label="University"><input disabled={!editing} onChange={(e) => setDraft({ ...draft, university: e.target.value })} value={draft.university} /></Field></div>
          <Field label="Email address"><input disabled value={draft.email} /></Field>
          <Field label="Bio"><textarea disabled={!editing} onChange={(e) => setDraft({ ...draft, bio: e.target.value })} value={draft.bio} /></Field>
          <fieldset className="skills-field" disabled={!editing}><legend>Tech stack</legend><div>{POPULAR_SKILLS.map((skill) => <button className={draft.techStack.includes(skill) ? "selected" : ""} key={skill} onClick={() => toggleSkill(skill)} type="button">{skill}</button>)}</div></fieldset>
          <div className="field-row"><label className="field"><span>Experience</span><select disabled={!editing} onChange={(e) => setDraft({ ...draft, experience: e.target.value as Experience })} value={draft.experience}><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></label><label className="field"><span>Availability</span><select disabled={!editing} onChange={(e) => setDraft({ ...draft, availability: e.target.value })} value={draft.availability}><option value="">Not specified</option><option>1–5 hours / week</option><option>6–10 hours / week</option><option>10+ hours / week</option></select></label></div>
          <Field label="GitHub"><input disabled={!editing} onChange={(e) => setDraft({ ...draft, github: e.target.value })} value={draft.github} /></Field>
          {editing && <div className="profile-actions"><button className="text-button" onClick={() => { setDraft(account); setEditing(false); }} type="button">Cancel</button><button className="button button-coral" type="submit">Save changes</button></div>}
        </div>
      </form>
    </div>
  );
}

export default function App() {
  const [view, setView] = useState<View>(routeFromHash);
  const [account, setAccount] = useState<Account | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const stored = localStorage.getItem(PROJECTS_KEY);
      return stored ? JSON.parse(stored) : STARTER_PROJECTS;
    } catch {
      return STARTER_PROJECTS;
    }
  });
  const [notices, setNotices] = useState<Notice[]>(() => {
    try {
      const stored = localStorage.getItem(NOTIFICATIONS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [savedItems, setSavedItems] = useState<SavedItem[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("campus-connect-saved") ?? "[]");
    } catch {
      return [];
    }
  });
  const [authenticated, setAuthenticated] = useState(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY) ?? sessionStorage.getItem(SESSION_KEY);
      if (!raw) return false;
      const session = JSON.parse(raw);
      return session.expiresAt > Date.now();
    } catch {
      return false;
    }
  });
  const tokenFromHash = useMemo(() => new URLSearchParams(window.location.hash.split("?")[1] ?? "").get("token"), [view]);

  useEffect(() => {
    if (!account) return;
    const legacy = account as Account & { password?: string };
    const migrate = async () => {
      const { password, ...safeAccount } = legacy;
      const migrated: Account = {
        ...safeAccount,
        passwordHash: safeAccount.passwordHash || (password ? await hashPassword(password) : ""),
        createdAt: safeAccount.createdAt || new Date().toISOString(),
        bio: safeAccount.bio || "",
        techStack: safeAccount.techStack || [],
        experience: safeAccount.experience || "Beginner",
        availability: safeAccount.availability || "",
        github: safeAccount.github || "",
        onboardingComplete: safeAccount.onboardingComplete || false,
        onboardingSkipped: safeAccount.onboardingSkipped || false,
      };
      if (password || !safeAccount.createdAt || !safeAccount.techStack) {
        setAccount(migrated);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
      }
    };
    void migrate();
  }, []);

  useEffect(() => {
    if (view === "verify" && tokenFromHash && account?.verificationToken === tokenFromHash) {
      const verified = { ...account, verified: true };
      setAccount(verified);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(verified));
      setView("login");
      window.location.hash = "login";
    }
  }, [tokenFromHash, view]);

  useEffect(() => {
    const onHashChange = () => setView(routeFromHash());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  useEffect(() => {
    if (!authenticated) return;
    const validateSession = () => {
      try {
        const raw = localStorage.getItem(SESSION_KEY) ?? sessionStorage.getItem(SESSION_KEY);
        const session = raw ? JSON.parse(raw) : null;
        if (!session || session.expiresAt <= Date.now() || session.email !== account?.email) {
          localStorage.removeItem(SESSION_KEY);
          sessionStorage.removeItem(SESSION_KEY);
          setAuthenticated(false);
          setView("login");
          window.location.hash = "login";
        }
      } catch {
        localStorage.removeItem(SESSION_KEY);
        sessionStorage.removeItem(SESSION_KEY);
        setAuthenticated(false);
        setView("login");
        window.location.hash = "login";
      }
    };
    validateSession();
    const timer = window.setInterval(validateSession, 30_000);
    return () => window.clearInterval(timer);
  }, [authenticated, account?.email]);

  const navigate = (next: View) => {
    setView(next);
    window.location.hash = next === "home" ? "" : next;
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const createAccount = (next: Account) => {
    if (account?.email === next.email) return false;
    setAccount(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    navigate("verify");
    return true;
  };

  const verify = () => {
    if (!account) return;
    const next = { ...account, verified: true };
    setAccount(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const saveAccount = (changes: Partial<Account>) => {
    if (!account) return;
    const next = { ...account, ...changes };
    setAccount(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const login = (remember: boolean) => {
    if (!account) return;
    const session = { email: account.email, expiresAt: Date.now() + (remember ? 30 * 24 * 60 * 60 * 1000 : 2 * 60 * 60 * 1000) };
    const storage = remember ? localStorage : sessionStorage;
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
    storage.setItem(SESSION_KEY, JSON.stringify(session));
    setAuthenticated(true);
    navigate(account.onboardingComplete || account.onboardingSkipped ? "dashboard" : "onboarding");
  };

  const logout = () => {
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
    setAuthenticated(false);
    navigate("login");
  };

  const requestReset = () => {
    if (!account) return null;
    const resetToken = crypto.randomUUID();
    saveAccount({ resetToken, resetExpiresAt: Date.now() + 30 * 60 * 1000 });
    return `${window.location.origin}${window.location.pathname}#reset?token=${resetToken}`;
  };

  const resetPassword = (passwordHash: string) => saveAccount({ passwordHash, resetToken: undefined, resetExpiresAt: undefined });
  const saveProjects = (next: Project[]) => {
    setProjects(next);
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(next));
  };
  const saveNotices = (next: Notice[]) => {
    setNotices(next);
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(next));
  };
  const createProject = (project: Project) => saveProjects([project, ...projects]);
  const joinProject = (projectId: string, message: string) => {
    if (!account) return;
    const project = projects.find((item) => item.id === projectId);
    if (!project) return;
    const request: JoinRequest = { id: crypto.randomUUID(), applicantEmail: account.email, applicantName: account.name, message, status: "pending" };
    saveProjects(projects.map((item) => item.id === projectId ? { ...item, requests: [...item.requests, request] } : item));
    saveNotices([{ id: crypto.randomUUID(), recipient: project.ownerEmail, title: `New request for ${project.title}`, detail: `${account.name} would like to join your project.`, createdAt: new Date().toISOString(), read: false }, ...notices]);
  };
  const decideRequest = (projectId: string, requestId: string, decision: "accepted" | "declined") => {
    const project = projects.find((item) => item.id === projectId);
    const request = project?.requests.find((item) => item.id === requestId);
    if (!project || !request) return;
    saveProjects(projects.map((item) => item.id === projectId ? {
      ...item,
      members: decision === "accepted" && !item.members.includes(request.applicantName) ? [...item.members, request.applicantName] : item.members,
      requests: item.requests.map((entry) => entry.id === requestId ? { ...entry, status: decision } : entry),
    } : item));
    saveNotices([{ id: crypto.randomUUID(), recipient: request.applicantEmail, title: `Request ${decision}`, detail: `${project.ownerName} ${decision} your request to join ${project.title}.`, createdAt: new Date().toISOString(), read: false }, ...notices]);
  };
  const readNotices = () => saveNotices(notices.map((notice) => notice.recipient === account?.email ? { ...notice, read: true } : notice));
  const visibleNotices = notices.filter((notice) => notice.recipient === account?.email);
  const toggleSaved = (item: SavedItem) => {
    const exists = savedItems.some((saved) => saved.id === item.id && saved.type === item.type);
    const next = exists ? savedItems.filter((saved) => saved.id !== item.id || saved.type !== item.type) : [item, ...savedItems];
    setSavedItems(next);
    localStorage.setItem("campus-connect-saved", JSON.stringify(next));
  };
  const protectedViews: View[] = ["onboarding", "dashboard", "projects", "my-projects", "internships", "mentors", "courses", "people", "saved", "profile", "notifications"];
  const visitorViews: View[] = ["signup", "login", "verify", "forgot", "reset"];

  if (protectedViews.includes(view) && (!authenticated || !account)) {
    if (view !== "login") setTimeout(() => navigate("login"), 0);
    return <Login account={account} navigate={navigate} onLogin={login} />;
  }
  if (authenticated && account && visitorViews.includes(view)) {
    setTimeout(() => navigate("dashboard"), 0);
    return <AppShell account={account} navigate={navigate} notices={visibleNotices} onCreateProject={createProject} onJoinProject={joinProject} onLogout={logout} onReadNotices={readNotices} onRequestDecision={decideRequest} onSave={saveAccount} onToggleSaved={toggleSaved} projects={projects} savedItems={savedItems} view="dashboard" />;
  }
  if (view === "signup") return <Signup navigate={navigate} onCreated={createAccount} />;
  if (view === "login") return <Login account={account} navigate={navigate} onLogin={login} />;
  if (view === "verify") return <Verify account={account} navigate={navigate} onVerify={verify} />;
  if (view === "forgot") return <ForgotPassword account={account} navigate={navigate} onRequest={requestReset} />;
  if (view === "reset") return <ResetPassword account={account} navigate={navigate} onReset={resetPassword} />;
  if (view === "onboarding" && account) return <Onboarding account={account} onSave={(changes) => { saveAccount(changes); navigate("dashboard"); }} onSkip={() => { saveAccount({ onboardingSkipped: true }); navigate("dashboard"); }} />;
  if (protectedViews.includes(view) && account) return <AppShell account={account} navigate={navigate} notices={visibleNotices} onCreateProject={createProject} onJoinProject={joinProject} onLogout={logout} onReadNotices={readNotices} onRequestDecision={decideRequest} onSave={saveAccount} onToggleSaved={toggleSaved} projects={projects} savedItems={savedItems} view={view} />;
  return <Landing navigate={navigate} />;
}
