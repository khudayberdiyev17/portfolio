"""Seed script with sample portfolio data."""
import asyncio
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.database import AsyncSessionLocal, engine, Base
from app.core.security import hash_password
from app.models import (
    AdminUser, About, Education, Experience, ExperienceItem,
    Project, ProjectImage, Certificate, SocialLink,
)


async def seed():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        # Create admin user
        admin = AdminUser(
            email="admin@example.com",
            hashed_password=hash_password("admin123"),
            full_name="Portfolio Admin",
            is_superuser=True,
            is_active=True,
        )
        db.add(admin)

        # About
        about = About(
            name="John Doe",
            shortly_me="Full-Stack Developer & UI/UX Enthusiast",
            bio="I build exceptional digital experiences that are fast, accessible, and visually stunning. Passionate about clean code, performance, and design systems.",
            avatar=None,
            skills=json.dumps(["Python", "FastAPI", "React", "TypeScript", "PostgreSQL", "Docker", "AWS"]),
            location="San Francisco, CA",
            available_for="Freelance projects, Full-time roles, Consulting",
        )
        db.add(about)

        # Education
        educations = [
            Education(
                degree="B.S. Computer Science",
                university="Stanford University",
                field_of_study="Computer Science",
                start_year=2016,
                end_year=2020,
                description="Focused on software engineering, algorithms, and distributed systems. Graduated with honors.",
            ),
            Education(
                degree="AWS Solutions Architect",
                university="Amazon Web Services",
                field_of_study="Cloud Computing",
                start_year=2022,
                end_year=2022,
                description="Professional certification in designing distributed systems on AWS.",
            ),
        ]
        for e in educations:
            db.add(e)

        # Experience summary
        exp_summary = Experience(exp_years=4, project_count=25)
        db.add(exp_summary)

        # Experience items
        experiences = [
            ExperienceItem(
                name="Senior Software Engineer",
                company_name="TechCorp Inc.",
                description="Lead development of microservices architecture serving 2M+ daily active users. Reduced API latency by 40% through caching strategies and query optimization.",
                technologies=json.dumps(["Python", "FastAPI", "PostgreSQL", "Redis", "Docker", "Kubernetes"]),
                work_type="hybrid",
                location="San Francisco, CA",
                start_date="Jan 2022",
                end_date=None,
                is_current=True,
                order=0,
            ),
            ExperienceItem(
                name="Full-Stack Developer",
                company_name="StartupXYZ",
                description="Built React dashboard with real-time data visualization. Developed REST APIs with FastAPI and managed CI/CD pipelines.",
                technologies=json.dumps(["React", "TypeScript", "FastAPI", "SQLite", "GitHub Actions"]),
                work_type="remote",
                location="New York, NY",
                start_date="Jun 2020",
                end_date="Dec 2021",
                is_current=False,
                order=1,
            ),
        ]
        for e in experiences:
            db.add(e)

        # Projects
        projects = [
            Project(
                title="CloudMetrics Dashboard",
                description="Real-time monitoring dashboard for cloud infrastructure with custom alerting.",
                long_description="A comprehensive dashboard that aggregates metrics from multiple cloud providers, featuring custom alerting rules, anomaly detection using ML, and exportable reports.",
                technologies=json.dumps(["React", "FastAPI", "PostgreSQL", "Redis", "Docker"]),
                category="Web Application",
                live_url="https://cloudmetrics.dev",
                github_url="https://github.com/johndoe/cloudmetrics",
                demo_gif=None,
                featured=True,
                order=0,
            ),
            Project(
                title="DevFlow CLI",
                description="A CLI tool that automates common development workflows and deployment tasks.",
                long_description="Command-line tool that automates repetitive development tasks including project scaffolding, git workflows, and deployment pipelines.",
                technologies=json.dumps(["Python", "Click", "Docker SDK", "GitHub API"]),
                category="Developer Tool",
                live_url=None,
                github_url="https://github.com/johndoe/devflow",
                featured=True,
                order=1,
            ),
            Project(
                title="AI Content Generator",
                description="SaaS platform powered by GPT models for automated content creation.",
                long_description="Full-stack SaaS application with Stripe payments, OpenAI integration, and a polished React editor interface.",
                technologies=json.dumps(["Next.js", "FastAPI", "PostgreSQL", "OpenAI", "Stripe"]),
                category="AI/ML",
                live_url="https://aicontent.ai",
                github_url=None,
                featured=False,
                order=2,
            ),
        ]
        for p in projects:
            db.add(p)

        await db.flush()

        # Project images
        images = [
            ProjectImage(project_id=1, image="/projects/screenshot1.png", caption="Dashboard overview", order=0),
            ProjectImage(project_id=1, image="/projects/screenshot2.png", caption="Alert configuration", order=1),
            ProjectImage(project_id=2, image="/projects/devflow1.png", caption="CLI help output", order=0),
        ]
        for img in images:
            db.add(img)

        # Certificates
        certs = [
            Certificate(
                title="AWS Solutions Architect Professional",
                issuer="Amazon Web Services",
                description="Advanced cloud architecture certification covering multi-region deployments, disaster recovery, and cost optimization.",
                skills=json.dumps(["AWS", "Cloud Architecture", "DevOps"]),
                verified=True,
                verify_url="https://aws.example.com/cert/123",
                issued_date="2023-03",
                order=0,
            ),
            Certificate(
                title="Google Cloud Professional Developer",
                issuer="Google Cloud",
                description="Certification for designing and managing cloud-native applications on Google Cloud Platform.",
                skills=json.dumps(["GCP", "Kubernetes", "CI/CD"]),
                verified=True,
                verify_url="https://cloud.google.com/cert/456",
                issued_date="2022-11",
                order=1,
            ),
            Certificate(
                title="Meta Frontend Developer",
                issuer="Meta (Facebook)",
                description="Professional certification for modern frontend development with React.",
                skills=json.dumps(["React", "JavaScript", "CSS", "HTML"]),
                verified=True,
                verify_url="https://coursera.org/professional-cert/meta-front-end",
                issued_date="2021-08",
                order=2,
            ),
        ]
        for c in certs:
            db.add(c)

        # Social links
        socials = [
            SocialLink(platform="GitHub", url="https://github.com/johndoe", icon="Github", order=0),
            SocialLink(platform="LinkedIn", url="https://linkedin.com/in/johndoe", icon="Linkedin", order=1),
            SocialLink(platform="Twitter", url="https://twitter.com/johndoe", icon="Twitter", order=2),
            SocialLink(platform="Email", url="mailto:john@example.com", icon="Mail", order=3),
        ]
        for s in socials:
            db.add(s)

        await db.commit()
        print("Seed data inserted successfully!")
        print("Admin login: admin@example.com / admin123")


if __name__ == "__main__":
    asyncio.run(seed())
