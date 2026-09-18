import { PrismaClient, Role, UserStatus, SoftwareStatus, LicenseStatus, LicenseType, BillingFrequency, AssignmentStatus, UtilizationStatus, RequestPriority, RequestStatus, RenewalStatus, RiskLevel, RecommendationType, RecommendationSeverity, RecommendationStatus, AlertSeverity } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Starting Database Seeding ---');

  // 1. Clean existing records safely
  await prisma.auditLog.deleteMany({});
  await prisma.alert.deleteMany({});
  await prisma.recommendation.deleteMany({});
  await prisma.costRecord.deleteMany({});
  await prisma.renewal.deleteMany({});
  await prisma.requestApproval.deleteMany({});
  await prisma.softwareRequest.deleteMany({});
  await prisma.usageRecord.deleteMany({});
  await prisma.licenseAssignment.deleteMany({});
  await prisma.license.deleteMany({});
  await prisma.software.deleteMany({});
  await prisma.vendor.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.department.deleteMany({});

  console.log('Cleared existing records.');

  // 2. Create Departments
  const deptsData = [
    { name: 'Engineering', code: 'ENG', budgetMonthly: 500000 },
    { name: 'Product & Design', code: 'DES', budgetMonthly: 300000 },
    { name: 'Quality Assurance', code: 'QA', budgetMonthly: 150000 },
    { name: 'Cloud Infrastructure & DevOps', code: 'OPS', budgetMonthly: 600000 },
    { name: 'Marketing & Content', code: 'MKT', budgetMonthly: 200000 },
  ];

  const departments: Record<string, any> = {};
  for (const d of deptsData) {
    const created = await prisma.department.create({ data: d });
    departments[d.code] = created;
  }
  console.log(`Created ${Object.keys(departments).length} departments.`);

  // 3. Create Users
  const passwordHash = await bcrypt.hash('Password@123', 10);

  const usersData = [
    {
      name: 'System Administrator',
      email: 'admin@enterprise.com',
      role: Role.ADMIN,
      designation: 'IT Systems Director',
      departmentId: departments['OPS'].id,
    },
    {
      name: 'Elena Rostova',
      email: 'manager.eng@enterprise.com',
      role: Role.MANAGER,
      designation: 'VP of Engineering',
      departmentId: departments['ENG'].id,
    },
    {
      name: 'Sarah Jenkins',
      email: 'manager.design@enterprise.com',
      role: Role.MANAGER,
      designation: 'Head of Product Design',
      departmentId: departments['DES'].id,
    },
    {
      name: 'Alex Chen',
      email: 'alex.chen@enterprise.com',
      role: Role.EMPLOYEE,
      designation: 'Staff Software Engineer',
      departmentId: departments['ENG'].id,
    },
    {
      name: 'Priya Patel',
      email: 'priya.patel@enterprise.com',
      role: Role.EMPLOYEE,
      designation: 'Senior Frontend Engineer',
      departmentId: departments['ENG'].id,
    },
    {
      name: 'David Kim',
      email: 'david.kim@enterprise.com',
      role: Role.EMPLOYEE,
      designation: 'Lead DevOps Engineer',
      departmentId: departments['OPS'].id,
    },
    {
      name: 'Jessica Parker',
      email: 'jessica.parker@enterprise.com',
      role: Role.EMPLOYEE,
      designation: 'Senior UX Designer',
      departmentId: departments['DES'].id,
    },
    {
      name: 'Marcus Johnson',
      email: 'marcus.johnson@enterprise.com',
      role: Role.EMPLOYEE,
      designation: 'Principal Product Manager',
      departmentId: departments['DES'].id,
    },
    {
      name: 'Aisha Khan',
      email: 'aisha.khan@enterprise.com',
      role: Role.EMPLOYEE,
      designation: 'Senior Automation QA Engineer',
      departmentId: departments['QA'].id,
    },
    {
      name: 'Rohit Verma',
      email: 'rohit.verma@enterprise.com',
      role: Role.EMPLOYEE,
      designation: 'Marketing Visual Specialist',
      departmentId: departments['MKT'].id,
    },
  ];

  const users: Record<string, any> = {};
  for (const u of usersData) {
    const created = await prisma.user.create({
      data: {
        ...u,
        passwordHash,
        status: UserStatus.ACTIVE,
      },
    });
    users[u.email] = created;
  }
  console.log(`Created ${Object.keys(users).length} users.`);

  // 4. Create Vendors
  const vendorsData = [
    {
      name: 'Adobe Inc.',
      contactPerson: 'David Wadhwani',
      email: 'enterprisesupport@adobe.com',
      phone: '+1-800-833-6687',
      website: 'https://adobe.com',
      notes: 'Global creative suite provider with multi-year enterprise license agreement.',
    },
    {
      name: 'Microsoft Corporation',
      contactPerson: 'Satya Team',
      email: 'support@microsoft.com',
      phone: '+1-800-642-7676',
      website: 'https://microsoft.com',
      notes: 'Office productivity, Azure cloud, and GitHub umbrella agreements.',
    },
    {
      name: 'Figma Inc.',
      contactPerson: 'Dylan Field',
      email: 'sales@figma.com',
      phone: '+1-415-555-0199',
      website: 'https://figma.com',
      notes: 'Collaborative cloud interface design enterprise tier.',
    },
    {
      name: 'Atlassian Pty Ltd',
      contactPerson: 'Scott Farquhar',
      email: 'support@atlassian.com',
      phone: '+61-2-9262-0777',
      website: 'https://atlassian.com',
      notes: 'Jira, Confluence, and developer workflow tools.',
    },
    {
      name: 'Slack Technologies',
      contactPerson: 'Salesforce Enterprise Support',
      email: 'feedback@slack.com',
      phone: '+1-800-667-6389',
      website: 'https://slack.com',
      notes: 'Enterprise Grid workspace messaging platform.',
    },
    {
      name: 'Zoom Video Communications',
      contactPerson: 'Eric Yuan',
      email: 'info@zoom.us',
      phone: '+1-888-799-9666',
      website: 'https://zoom.us',
      notes: 'Corporate video communications and webinar licensing.',
    },
    {
      name: 'Amazon Web Services Inc.',
      contactPerson: 'AWS Accounts Desk',
      email: 'aws-support@amazon.com',
      phone: '+1-206-266-1000',
      website: 'https://aws.amazon.com',
      notes: 'Cloud computing infrastructure capacity units.',
    },
    {
      name: 'Autodesk Inc.',
      contactPerson: 'Andrew Anagnost',
      email: 'support@autodesk.com',
      phone: '+1-415-507-5000',
      website: 'https://autodesk.com',
      notes: 'AEC 3D engineering and architecture workstation licensing.',
    },
    {
      name: 'Canva Pty Ltd',
      contactPerson: 'Melanie Perkins',
      email: 'enterprise@canva.com',
      phone: '+61-2-8000-0000',
      website: 'https://canva.com',
      notes: 'Marketing template and social graphics design tool.',
    },
  ];

  const vendors: Record<string, any> = {};
  for (const v of vendorsData) {
    const created = await prisma.vendor.create({ data: v });
    vendors[v.name] = created;
  }
  console.log(`Created ${Object.keys(vendors).length} vendors.`);

  // 5. Create Software & Licenses
  // Note: Adobe Creative Cloud matches the exact test scenario: 50 total, ₹1,000/mo, 35 assigned!
  const today = new Date();
  const past30Days = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
  const next15Days = new Date(today.getTime() + 15 * 24 * 60 * 60 * 1000);
  const next5Days = new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000);
  const next90Days = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000);
  const expired5DaysAgo = new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000);

  const softwareCatalog = [
    {
      name: 'Adobe Creative Cloud',
      vendorName: 'Adobe Inc.',
      category: 'Design & Multimedia',
      version: '2026.2',
      description: 'Industry-standard graphics, video editing, and digital design suite.',
      website: 'https://adobe.com/creativecloud',
      license: {
        totalQuantity: 50,
        costPerLicense: 1000,
        billingFrequency: BillingFrequency.MONTHLY,
        renewalDate: next90Days,
        assignedCount: 35, // 35 assigned, 15 unused!
      }
    },
    {
      name: 'Microsoft 365 Enterprise',
      vendorName: 'Microsoft Corporation',
      category: 'Productivity & Office',
      version: 'E5 Enterprise',
      description: 'Comprehensive office productivity, enterprise email, and identity security.',
      website: 'https://microsoft.com/microsoft-365',
      license: {
        totalQuantity: 120,
        costPerLicense: 850,
        billingFrequency: BillingFrequency.MONTHLY,
        renewalDate: next15Days, // Due in 15 days (DUE_30_DAYS)
        assignedCount: 110,
      }
    },
    {
      name: 'Figma Enterprise',
      vendorName: 'Figma Inc.',
      category: 'Design & Prototyping',
      version: '2026 Enterprise',
      description: 'Collaborative UI design and rapid interactive component prototyping platform.',
      website: 'https://figma.com',
      license: {
        totalQuantity: 40,
        costPerLicense: 3500,
        billingFrequency: BillingFrequency.MONTHLY,
        renewalDate: next5Days, // Due in 5 days (CRITICAL_7_DAYS)!
        assignedCount: 22, // 22/40 = 55% utilization
      }
    },
    {
      name: 'Jira Software Enterprise',
      vendorName: 'Atlassian Pty Ltd',
      category: 'Project Management',
      version: 'Cloud Data Center',
      description: 'Agile planning, sprint tracking, and software release management.',
      website: 'https://atlassian.com/software/jira',
      license: {
        totalQuantity: 80,
        costPerLicense: 750,
        billingFrequency: BillingFrequency.MONTHLY,
        renewalDate: next90Days,
        assignedCount: 70,
      }
    },
    {
      name: 'Slack Business+',
      vendorName: 'Slack Technologies',
      category: 'Team Collaboration',
      version: 'Grid Plus',
      description: 'Real-time asynchronous messaging, channel workflows, and enterprise connect.',
      website: 'https://slack.com',
      license: {
        totalQuantity: 100,
        costPerLicense: 600,
        billingFrequency: BillingFrequency.MONTHLY,
        renewalDate: next90Days,
        assignedCount: 92,
      }
    },
    {
      name: 'Zoom One Enterprise',
      vendorName: 'Zoom Video Communications',
      category: 'Video Conferencing',
      version: '5.18 Pro',
      description: 'HD meetings, unified team chat, cloud phone, and enterprise webinars.',
      website: 'https://zoom.us',
      license: {
        totalQuantity: 50,
        costPerLicense: 1200,
        billingFrequency: BillingFrequency.MONTHLY,
        renewalDate: past30Days, // Expired
        assignedCount: 25, // 50% utilization
      }
    },
    {
      name: 'Autodesk AEC Collection',
      vendorName: 'Autodesk Inc.',
      category: '3D CAD & Engineering',
      version: '2026 Multi-User',
      description: 'BIM and CAD software for architecture, engineering, and structural construction.',
      website: 'https://autodesk.com',
      license: {
        totalQuantity: 10,
        costPerLicense: 12500, // High cost
        billingFrequency: BillingFrequency.MONTHLY,
        renewalDate: next15Days,
        assignedCount: 4, // 4/10 = 40% utilization
      }
    },
    {
      name: 'Canva Pro Enterprise',
      vendorName: 'Canva Pty Ltd',
      category: 'Design & Multimedia', // Duplicate category with Adobe!
      version: 'Teams 2026',
      description: 'Simplified marketing templates, brand kits, and quick visual assets.',
      website: 'https://canva.com',
      license: {
        totalQuantity: 30,
        costPerLicense: 450,
        billingFrequency: BillingFrequency.MONTHLY,
        renewalDate: next90Days,
        assignedCount: 28,
      }
    },
  ];

  const employeeUserList = Object.values(users);

  for (const item of softwareCatalog) {
    const sw = await prisma.software.create({
      data: {
        name: item.name,
        category: item.category,
        description: item.description,
        version: item.version,
        website: item.website,
        status: SoftwareStatus.ACTIVE,
        vendorId: vendors[item.vendorName].id,
      },
    });

    const licStatus = item.license.renewalDate < today 
      ? LicenseStatus.EXPIRED 
      : (item.license.renewalDate <= next15Days ? LicenseStatus.EXPIRING_SOON : LicenseStatus.ACTIVE);

    const lic = await prisma.license.create({
      data: {
        softwareId: sw.id,
        vendorId: vendors[item.vendorName].id,
        licenseType: LicenseType.PER_USER,
        totalQuantity: item.license.totalQuantity,
        costPerLicense: item.license.costPerLicense,
        billingFrequency: item.license.billingFrequency,
        purchaseDate: past30Days,
        startDate: past30Days,
        renewalDate: item.license.renewalDate,
        expiryDate: new Date(item.license.renewalDate.getTime() + 365 * 24 * 60 * 60 * 1000),
        status: licStatus,
        notes: `Enterprise license package for ${item.name}`,
      },
    });

    // Create assignments up to assignedCount
    // Distribute among users
    const countToAssign = Math.min(item.license.assignedCount, employeeUserList.length);
    for (let i = 0; i < countToAssign; i++) {
      const u = employeeUserList[i % employeeUserList.length];
      await prisma.licenseAssignment.create({
        data: {
          licenseId: lic.id,
          userId: u.id,
          departmentId: u.departmentId,
          assignedDate: past30Days,
          status: AssignmentStatus.ACTIVE,
          notes: `Automated provisioning for ${u.name}`,
        },
      });

      // Create usage record
      await prisma.usageRecord.create({
        data: {
          userId: u.id,
          softwareId: sw.id,
          licenseId: lic.id,
          lastActiveDate: new Date(today.getTime() - (i % 7) * 24 * 60 * 60 * 1000),
          loginCount: 15 + (i * 3),
          hoursUsed: 25.5 + (i * 4.2),
          utilizationStatus: i % 4 === 0 ? UtilizationStatus.LOW : (i % 3 === 0 ? UtilizationStatus.HIGH : UtilizationStatus.MODERATE),
        },
      });
    }

    // Create Renewal Record
    let renewalStatus: RenewalStatus = RenewalStatus.UPCOMING;
    let riskLevel: RiskLevel = RiskLevel.LOW;

    const daysUntilRenewal = Math.ceil((item.license.renewalDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntilRenewal < 0) {
      renewalStatus = RenewalStatus.EXPIRED;
      riskLevel = RiskLevel.CRITICAL;
    } else if (daysUntilRenewal <= 7) {
      renewalStatus = RenewalStatus.DUE_7_DAYS;
      riskLevel = RiskLevel.HIGH;
    } else if (daysUntilRenewal <= 30) {
      renewalStatus = RenewalStatus.DUE_30_DAYS;
      riskLevel = RiskLevel.MEDIUM;
    }

    await prisma.renewal.create({
      data: {
        licenseId: lic.id,
        softwareId: sw.id,
        renewalDate: item.license.renewalDate,
        estimatedCost: item.license.totalQuantity * item.license.costPerLicense,
        status: renewalStatus,
        riskLevel,
        autoRenew: false,
        notes: `Next scheduled contract renewal evaluation.`,
      },
    });

    // Create Cost Record
    await prisma.costRecord.create({
      data: {
        softwareId: sw.id,
        departmentId: departments['ENG'].id,
        month: today.getMonth() + 1,
        year: today.getFullYear(),
        allocatedCost: item.license.assignedCount * item.license.costPerLicense,
        wastedCost: (item.license.totalQuantity - item.license.assignedCount) * item.license.costPerLicense,
      },
    });
  }

  console.log('Created software, licenses, assignments, usage records, renewals, and cost records.');

  // 6. Pre-seed Explainable Recommendations
  // Rule 1: Adobe Creative Cloud has 15 unused licenses out of 50 (70% util)
  const adobeSw = await prisma.software.findFirst({ where: { name: 'Adobe Creative Cloud' }, include: { licenses: true } });
  if (adobeSw && adobeSw.licenses[0]) {
    await prisma.recommendation.create({
      data: {
        softwareId: adobeSw.id,
        licenseId: adobeSw.licenses[0].id,
        type: RecommendationType.REALLOCATE_UNUSED,
        severity: RecommendationSeverity.WARNING,
        title: 'Review Unused Adobe Creative Cloud Licenses',
        reason: '15 of 50 licenses are currently unassigned and generating unused seat expenditure.',
        supportingMetrics: {
          totalLicenses: 50,
          assigned: 35,
          unused: 15,
          utilizationRate: 70,
          costPerLicense: 1000,
        },
        estimatedMonthlySavings: 15000,
        estimatedAnnualSavings: 180000,
        suggestedAction: 'Review these 15 unused licenses for reallocation across creative teams or contract reduction at renewal.',
        status: RecommendationStatus.NEW,
      },
    });
  }

  // Rule 4: Autodesk AEC Collection has 4/10 utilization at ₹12,500/license
  const autoSw = await prisma.software.findFirst({ where: { name: 'Autodesk AEC Collection' }, include: { licenses: true } });
  if (autoSw && autoSw.licenses[0]) {
    await prisma.recommendation.create({
      data: {
        softwareId: autoSw.id,
        licenseId: autoSw.licenses[0].id,
        type: RecommendationType.COST_OPTIMIZATION,
        severity: RecommendationSeverity.CRITICAL,
        title: 'High-Cost Software Underutilization: Autodesk AEC Collection',
        reason: 'Utilization is at 40% (4 of 10 seats active) while monthly cost is ₹12,500 per license.',
        supportingMetrics: {
          totalLicenses: 10,
          assigned: 4,
          unused: 6,
          utilizationRate: 40,
          costPerLicense: 12500,
        },
        estimatedMonthlySavings: 75000,
        estimatedAnnualSavings: 900000,
        suggestedAction: 'Downsize tier from 10 to 5 seats to save ₹75,000/month prior to upcoming renewal.',
        status: RecommendationStatus.NEW,
      },
    });
  }

  // Rule 5: Duplicate Category overlap (Adobe CC + Canva Pro Enterprise)
  if (adobeSw) {
    await prisma.recommendation.create({
      data: {
        softwareId: adobeSw.id,
        type: RecommendationType.DUPLICATE_CONSOLIDATION,
        severity: RecommendationSeverity.INFO,
        title: 'Potential Design & Multimedia Tool Overlap',
        reason: 'Both Adobe Creative Cloud and Canva Pro Enterprise are concurrently active in Design & Marketing.',
        supportingMetrics: {
          overlappingTools: ['Adobe Creative Cloud', 'Canva Pro Enterprise'],
          category: 'Design & Multimedia',
          combinedSpendMonthly: 63500,
        },
        estimatedMonthlySavings: 12600,
        estimatedAnnualSavings: 151200,
        suggestedAction: 'Survey non-designer staff on Canva usage to determine whether standardized Adobe seats can fulfill workflow requirements.',
        status: RecommendationStatus.NEW,
      },
    });
  }

  // 7. Seed Initial Realistic Alerts
  const alertsData = [
    {
      severity: AlertSeverity.CRITICAL,
      title: 'Zoom One Enterprise License Expired',
      message: 'Zoom One Enterprise contract passed renewal deadline. Please verify active enterprise service status.',
      entityType: 'LICENSE',
    },
    {
      severity: AlertSeverity.CRITICAL,
      title: 'Figma Enterprise Renewal Imminent (5 Days)',
      message: 'Figma Enterprise subscription renews in 5 days. 18 unused seats detected with potential ₹63,000/month saving.',
      entityType: 'RENEWAL',
    },
    {
      severity: AlertSeverity.WARNING,
      title: 'Microsoft 365 Renewal in 15 Days',
      message: 'Microsoft 365 Enterprise renewal is scheduled within 15 days. Current utilization is healthy at 91.6%.',
      entityType: 'RENEWAL',
    },
    {
      severity: AlertSeverity.WARNING,
      title: 'High Idle Cost: Autodesk AEC Collection',
      message: 'Autodesk AEC Collection has ₹75,000/month in unused seat expenditure with only 40% active utilization.',
      entityType: 'COST',
    },
  ];

  for (const a of alertsData) {
    await prisma.alert.create({ data: a });
  }

  // 8. Seed a sample software request
  if (adobeSw && users['alex.chen@enterprise.com']) {
    await prisma.softwareRequest.create({
      data: {
        userId: users['alex.chen@enterprise.com'].id,
        softwareId: adobeSw.id,
        priority: RequestPriority.MEDIUM,
        reason: 'Need Photoshop and Illustrator for UI component vector styling and marketing documentation assets.',
        status: RequestStatus.PENDING,
        comments: 'Request submitted for design review.',
      },
    });
  }

  console.log('--- Database Seeding Completed Successfully ---');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
