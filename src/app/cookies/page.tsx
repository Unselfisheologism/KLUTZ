'use client';

import Head from 'next/head';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Mail, Calendar, Cookie, Shield, Settings } from 'lucide-react';

export default function CookiesPage() {
  return (
    <>
      <Head>
        <link rel="canonical" href="https://klutz.netlify.app/cookies" />
      </Head>
      <CookiesContent />
    </>
  );
}

const CookiesContent = () => (
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
              <h2 className="font-headline text-2xl text-primary mb-4">Our Approach to Cookies</h2>
              <p>
                We want to be clear and transparent about how we handle your data.
                **KLUTZ does not collect or store any cookie information from your browser.**
                We do not use cookies for tracking, analytics, advertising, or any other purpose.
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="font-headline text-2xl text-primary mb-4">Browser-Managed Information</h2>
              <p>
                While we don't use cookies, your web browser may store certain information in its cache or local storage
                to improve your browsing experience. This is a standard browser function and is not data that we access,
                collect, or manage.
                </p>
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