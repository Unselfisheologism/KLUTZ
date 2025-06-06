'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Mail, Calendar, Cookie, Shield, Settings } from 'lucide-react';

export default function CookiesPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="font-headline text-4xl text-primary flex items-center justify-center">
              <Cookie className="mr-3 h-8 w-8" />
              Cookies Policy
            </CardTitle>
            <CardDescription className="text-lg">
              How KLUTZ uses cookies and similar technologies
            </CardDescription>
          </CardHeader>
          <CardContent className="prose prose-lg max-w-none space-y-8">
            <section>
              <h2 className="font-headline text-2xl text-primary mb-4">What Are Cookies?</h2>
              <p>
                Cookies are small text files that are stored on your device when you visit websites. They help websites 
                remember information about your visit, which can make your next visit easier and the site more useful to you. 
                KLUTZ uses cookies to enhance your experience across all our AI tools including MediScan AI, AI Problem Solver, 
                AI Translator, Text-to-Image Generator, and others.
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="font-headline text-2xl text-primary mb-4">How We Use Cookies</h2>
              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center">
                  <Shield className="mr-2 h-5 w-5" />
                  Essential Cookies
                </h3>
                <p>These cookies are necessary for the website to function and cannot be switched off:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>Authentication:</strong> Remember your login status with Puter</li>
                  <li><strong>Security:</strong> Protect against cross-site request forgery</li>
                  <li><strong>Session Management:</strong> Maintain your session across tool usage</li>
                  <li><strong>Load Balancing:</strong> Ensure optimal performance</li>
                </ul>

                <h3 className="font-semibold text-lg flex items-center">
                  <Settings className="mr-2 h-5 w-5" />
                  Functional Cookies
                </h3>
                <p>These cookies enable enhanced functionality and personalization:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>Theme Preferences:</strong> Remember your light/dark mode choice</li>
                  <li><strong>Language Settings:</strong> Store your preferred language for AI Translator</li>
                  <li><strong>Tool Preferences:</strong> Remember settings across different KLUTZ tools</li>
                  <li><strong>Form Data:</strong> Temporarily store form inputs to prevent data loss</li>
                </ul>
              </div>
            </section>

            <Separator />

            <section>
              <h2 className="font-headline text-2xl text-primary mb-4">Cookies We Use</h2>
              
              <div className="space-y-6">
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-lg">Authentication Cookies</h3>
                  <div className="text-sm mt-2 space-y-1">
                    <p><strong>Name:</strong> puter_auth_token</p>
                    <p><strong>Purpose:</strong> Maintains your login session with Puter</p>
                    <p><strong>Duration:</strong> Session (deleted when browser closes)</p>
                    <p><strong>Type:</strong> Essential</p>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-lg">Theme Preference</h3>
                  <div className="text-sm mt-2 space-y-1">
                    <p><strong>Name:</strong> theme</p>
                    <p><strong>Purpose:</strong> Remembers your light/dark mode preference</p>
                    <p><strong>Duration:</strong> 1 year</p>
                    <p><strong>Type:</strong> Functional</p>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-lg">Sidebar State</h3>
                  <div className="text-sm mt-2 space-y-1">
                    <p><strong>Name:</strong> sidebar_state</p>
                    <p><strong>Purpose:</strong> Remembers sidebar collapsed/expanded state</p>
                    <p><strong>Duration:</strong> 7 days</p>
                    <p><strong>Type:</strong> Functional</p>
                  </div>
                </div>
              </div>
            </section>

            <Separator />

            <section>
              <h2 className="font-headline text-2xl text-primary mb-4">Third-Party Cookies</h2>
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Puter.js Services</h3>
                <p>
                  When you use KLUTZ tools, you interact with Puter.js services for AI processing. Puter may set their own 
                  cookies for authentication and service delivery. These cookies are governed by Puter's privacy policy.
                </p>

                <h3 className="font-semibold text-lg">Font Loading</h3>
                <p>
                  We use Google Fonts (PT Sans and Space Grotesk) which may set cookies for font optimization and delivery. 
                  These are minimal and used only for font rendering performance.
                </p>
              </div>
            </section>

            <Separator />

            <section>
              <h2 className="font-headline text-2xl text-primary mb-4">What We Don't Use</h2>
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-md border border-green-200 dark:border-green-800">
                <h3 className="font-semibold text-lg text-green-700 dark:text-green-300 mb-2">Privacy-First Approach</h3>
                <ul className="list-disc pl-6 space-y-1 text-green-600 dark:text-green-400">
                  <li><strong>No Advertising Cookies:</strong> We don't use cookies for advertising or tracking</li>
                  <li><strong>No Analytics Tracking:</strong> We don't track your behavior across websites</li>
                  <li><strong>No Social Media Pixels:</strong> We don't use social media tracking pixels</li>
                  <li><strong>No Cross-Site Tracking:</strong> We don't track you across other websites</li>
                  <li><strong>No Behavioral Profiling:</strong> We don't build profiles of your interests</li>
                </ul>
              </div>
            </section>

            <Separator />

            <section>
              <h2 className="font-headline text-2xl text-primary mb-4">Tool-Specific Cookie Usage</h2>
              
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">MediScan AI</h3>
                <p>
                  Medical image uploads are processed without additional cookies. Session cookies ensure secure processing 
                  and immediate deletion of medical data after analysis.
                </p>

                <h3 className="font-semibold text-lg">AI Problem Solver</h3>
                <p>
                  May temporarily store problem type preferences and input method choices to improve user experience 
                  across sessions.
                </p>

                <h3 className="font-semibold text-lg">AI Translator</h3>
                <p>
                  Stores language preferences and recently used language pairs to speed up future translations.
                </p>

                <h3 className="font-semibold text-lg">Content Analysis Tools</h3>
                <p>
                  Ethnicity Certifier, Neurodiversity Checker, and Heatmap Generator may store analysis preferences 
                  and input type selections.
                </p>

                <h3 className="font-semibold text-lg">Troubleshooting Tools</h3>
                <p>
                  Appliance and Vehicle Troubleshooters may remember device type selections and issue categories 
                  for faster future use.
                </p>

                <h3 className="font-semibold text-lg">Utility Tools</h3>
                <p>
                  Measuring Tool, Ingredients Checker, Image to Text Converter, and Date & Time Checker may store 
                  unit preferences and analysis settings.
                </p>
              </div>
            </section>

            <Separator />

            <section>
              <h2 className="font-headline text-2xl text-primary mb-4">Managing Cookies</h2>
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Browser Controls</h3>
                <p>You can control cookies through your browser settings:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>Block All Cookies:</strong> Prevent all cookies (may break functionality)</li>
                  <li><strong>Block Third-Party Cookies:</strong> Allow only first-party cookies</li>
                  <li><strong>Delete Cookies:</strong> Remove existing cookies</li>
                  <li><strong>Incognito/Private Mode:</strong> Browse without storing cookies</li>
                </ul>

                <h3 className="font-semibold text-lg">Impact of Disabling Cookies</h3>
                <p>If you disable cookies, some features may not work properly:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>You may need to log in repeatedly</li>
                  <li>Theme and language preferences won't be saved</li>
                  <li>Some tools may not remember your settings</li>
                  <li>Overall user experience may be degraded</li>
                </ul>
              </div>
            </section>

            <Separator />

            <section>
              <h2 className="font-headline text-2xl text-primary mb-4">Cookie Consent</h2>
              <p>
                By using KLUTZ, you consent to our use of essential cookies necessary for the service to function. 
                Functional cookies that enhance your experience are used with your implied consent through continued 
                use of the service. You can withdraw consent by adjusting your browser settings or contacting us.
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="font-headline text-2xl text-primary mb-4">Updates to Cookie Policy</h2>
              <p>
                We may update this Cookie Policy periodically to reflect changes in our practices or for legal reasons. 
                We will notify users of significant changes via email or prominent notice on our service. The "Last Updated" 
                date at the top indicates when the policy was last modified.
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="font-headline text-2xl text-primary mb-4">Contact Us</h2>
              <div className="flex items-center space-x-2">
                <Mail className="h-5 w-5 text-accent" />
                <span>For questions about our use of cookies, contact us at: </span>
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
}