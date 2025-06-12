'use client';

import Head from 'next/head';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Mail, Calendar, Shield, Eye, Lock } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <>
      <Head>
        <link rel="canonical" href="https://klutz.netlify.app/privacy-policy" />
      </Head>
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="font-headline text-4xl text-primary flex items-center justify-center">
              <Eye className="mr-3 h-8 w-8" />
              Privacy Policy
            </CardTitle>
            <CardDescription className="text-lg">
              Last updated: January 2025
            </CardDescription>
          </CardHeader>
          <CardContent className="prose prose-lg max-w-none space-y-8">
            <section>
              <h2 className="font-headline text-2xl text-primary mb-4">1. Information We Collect</h2>
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">1.1 Content You Provide</h3>
                <p>
                  When using KLUTZ tools, you may provide various types of content including:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>Medical Images</strong> - For MediScan AI analysis (X-rays, MRI, CT scans)</li>
                  <li><strong>Academic Problems</strong> - Text and images for AI Problem Solver</li>
                  <li><strong>Text for Translation</strong> - Content processed by AI Translator</li>
                  <li><strong>Image Descriptions</strong> - Prompts for Text-to-Image Generator</li>
                  <li><strong>Thumbnails and Titles</strong> - For consistency checking</li>
                  <li><strong>Content for Analysis</strong> - Images and text for ethnicity, neurodiversity, and engagement analysis</li>
                  <li><strong>Device Images</strong> - For appliance and vehicle troubleshooting</li>
                  <li><strong>Measurement Targets</strong> - Images and descriptions for measuring tools</li>
                  <li><strong>Food Images/Text</strong> - For ingredients analysis</li>
                  <li><strong>Date/Time Queries</strong> - For historical and astronomical information</li>
                </ul>

                <h3 className="font-semibold text-lg">1.2 Technical Information</h3>
                <p>We may collect technical information including:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Browser type and version</li>
                  <li>Device information</li>
                  <li>IP address (anonymized)</li>
                  <li>Usage patterns and preferences</li>
                </ul>
              </div>
            </section>

            <Separator />

            <section>
              <h2 className="font-headline text-2xl text-primary mb-4">2. How We Use Your Information</h2>
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">2.1 Service Provision</h3>
                <p>Your content is used to:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Process AI analysis requests across all tools</li>
                  <li>Generate reports and insights</li>
                  <li>Provide accurate translations and problem solutions</li>
                  <li>Create images from text descriptions</li>
                  <li>Analyze content for various purposes (accessibility, engagement, etc.)</li>
                </ul>

                <h3 className="font-semibold text-lg">2.2 Service Improvement</h3>
                <p>We may use aggregated, anonymized data to:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Improve AI model performance</li>
                  <li>Enhance user experience</li>
                  <li>Develop new features</li>
                  <li>Fix bugs and technical issues</li>
                </ul>
              </div>
            </section>

            <Separator />

            <section>
              <h2 className="font-headline text-2xl text-primary mb-4">3. Data Storage and Security</h2>
              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center">
                  <Lock className="mr-2 h-5 w-5" />
                  3.1 Temporary Processing
                </h3>
                <p>
                  <strong>Important:</strong> Images and text you upload are processed temporarily for AI analysis and are not 
                  permanently stored on our servers. Content is typically processed and discarded within minutes of upload.
                </p>

                <h3 className="font-semibold text-lg">3.2 Third-Party Processing</h3>
                <p>
                  Our service uses Puter.js for AI processing. Your content may be temporarily processed by third-party AI services 
                  subject to their privacy policies. We ensure these services meet appropriate privacy and security standards.
                </p>

                <h3 className="font-semibold text-lg">3.3 Security Measures</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Encrypted data transmission (HTTPS)</li>
                  <li>Secure authentication via Puter.js</li>
                  <li>Regular security audits</li>
                  <li>Access controls and monitoring</li>
                </ul>
              </div>
            </section>

            <Separator />

            <section>
              <h2 className="font-headline text-2xl text-primary mb-4">4. Medical Data Privacy</h2>
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md border border-red-200 dark:border-red-800">
                <h3 className="font-semibold text-lg text-red-700 dark:text-red-300 mb-2">Special Protections for Medical Content</h3>
                <ul className="list-disc pl-6 space-y-1 text-red-600 dark:text-red-400">
                  <li>Medical images uploaded to MediScan AI are processed with enhanced security</li>
                  <li>No medical data is stored permanently</li>
                  <li>Processing is done in secure, isolated environments</li>
                  <li>We do not share medical content with third parties for training purposes</li>
                  <li>Users should remove personal identifiers before uploading medical images</li>
                </ul>
              </div>
            </section>

            <Separator />

            <section>
              <h2 className="font-headline text-2xl text-primary mb-4">5. Cookies and Tracking</h2>
              <p>
                We use minimal cookies for essential functionality including:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Authentication state management</li>
                <li>User preferences (theme, language)</li>
                <li>Session management</li>
              </ul>
              <p>
                We do not use tracking cookies for advertising purposes. See our Cookies Policy for detailed information.
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="font-headline text-2xl text-primary mb-4">6. Data Sharing</h2>
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">6.1 No Sale of Personal Data</h3>
                <p>We do not sell, rent, or trade your personal information to third parties.</p>

                <h3 className="font-semibold text-lg">6.2 Service Providers</h3>
                <p>We may share data with trusted service providers who:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Help us provide AI processing capabilities</li>
                  <li>Assist with technical infrastructure</li>
                  <li>Are bound by strict confidentiality agreements</li>
                </ul>

                <h3 className="font-semibold text-lg">6.3 Legal Requirements</h3>
                <p>We may disclose information when required by law or to protect our rights and users' safety.</p>
              </div>
            </section>

            <Separator />

            <section>
              <h2 className="font-headline text-2xl text-primary mb-4">7. Your Rights</h2>
              <p>You have the right to:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Access information about your data usage</li>
                <li>Request deletion of any stored personal information</li>
                <li>Opt out of non-essential data collection</li>
                <li>Receive a copy of your data in a portable format</li>
                <li>Correct inaccurate personal information</li>
              </ul>
            </section>

            <Separator />

            <section>
              <h2 className="font-headline text-2xl text-primary mb-4">8. Children's Privacy</h2>
              <p>
                Our service is not intended for children under 13. We do not knowingly collect personal information from 
                children under 13. If you believe a child has provided us with personal information, please contact us immediately.
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="font-headline text-2xl text-primary mb-4">9. International Data Transfers</h2>
              <p>
                Your data may be processed in countries other than your own. We ensure appropriate safeguards are in place 
                to protect your privacy rights regardless of processing location.
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="font-headline text-2xl text-primary mb-4">10. Changes to Privacy Policy</h2>
              <p>
                We may update this Privacy Policy periodically. We will notify users of significant changes via email or 
                prominent notice on our service. Your continued use constitutes acceptance of the updated policy.
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="font-headline text-2xl text-primary mb-4">11. Contact Us</h2>
              <div className="flex items-center space-x-2">
                <Mail className="h-5 w-5 text-accent" />
                <span>For privacy-related questions or to exercise your rights, contact us at: </span>
                <a href="mailto:jeffrinjames99@gmail.com" className="text-primary hover:underline font-semibold">
                  jeffrinjames99@gmail.com
                </a>
              </div>
            </section>

            <Separator />

            <section className="text-center text-muted-foreground">
              <p className="flex items-center justify-center">
                <Calendar className="h-4 w-4 mr-2" />
                Last updated: January 2025
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
    </>
)}    