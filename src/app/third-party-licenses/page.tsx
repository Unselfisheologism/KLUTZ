'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Mail, Calendar, Package, ExternalLink } from 'lucide-react';

export default function ThirdPartyLicensesPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="font-headline text-4xl text-primary flex items-center justify-center">
              <Package className="mr-3 h-8 w-8" />
              Third-Party Licenses
            </CardTitle>
            <CardDescription className="text-lg">
              Open source libraries and services used in KLUTZ
            </CardDescription>
          </CardHeader>
          <CardContent className="prose prose-lg max-w-none space-y-8">
            <section>
              <h2 className="font-headline text-2xl text-primary mb-4">Acknowledgments</h2>
              <p>
                KLUTZ is built using various open-source libraries and third-party services. We are grateful to the 
                developers and maintainers of these projects. This page lists the major dependencies used across all 
                our AI tools including MediScan AI, AI Problem Solver, AI Translator, Text-to-Image Generator, and others.
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="font-headline text-2xl text-primary mb-4">Core Framework & Runtime</h2>
              
              <div className="space-y-6">
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-lg flex items-center">
                    Next.js
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">Version: 15.2.3</p>
                  <p>The React framework for production applications.</p>
                  <p className="text-sm mt-2">
                    <strong>License:</strong> MIT License<br/>
                    <strong>Copyright:</strong> Vercel, Inc.<br/>
                    <strong>Website:</strong> <a href="https://nextjs.org" className=\"text-primary hover:underline">https://nextjs.org</a>
                  </p>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-lg flex items-center">
                    React
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">Version: 18.3.1</p>
                  <p>A JavaScript library for building user interfaces.</p>
                  <p className="text-sm mt-2">
                    <strong>License:</strong> MIT License<br/>
                    <strong>Copyright:</strong> Meta Platforms, Inc.<br/>
                    <strong>Website:</strong> <a href="https://react.dev" className=\"text-primary hover:underline">https://react.dev</a>
                  </p>
                </div>
              </div>
            </section>

            <Separator />

            <section>
              <h2 className="font-headline text-2xl text-primary mb-4">AI & Processing Services</h2>
              
              <div className="space-y-6">
                <div className="border rounded-lg p-4 bg-blue-50 dark:bg-blue-900/20">
                  <h3 className="font-semibold text-lg flex items-center">
                    Puter.js SDK
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">Core AI Processing Service</p>
                  <p>
                    Primary AI service powering all KLUTZ tools including medical image analysis, problem solving, 
                    translation, image generation, content analysis, troubleshooting, and more.
                  </p>
                  <p className="text-sm mt-2">
                    <strong>Service:</strong> Puter Cloud Platform<br/>
                    <strong>Website:</strong> <a href="https://puter.com" className=\"text-primary hover:underline">https://puter.com</a><br/>
                    <strong>Used in:</strong> All KLUTZ AI tools
                  </p>
                </div>
              </div>
            </section>

            <Separator />

            <section>
              <h2 className="font-headline text-2xl text-primary mb-4">UI Components & Styling</h2>
              
              <div className="space-y-6">
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-lg">Tailwind CSS</h3>
                  <p className="text-sm text-muted-foreground mb-2">Version: 3.4.1</p>
                  <p>A utility-first CSS framework for rapid UI development.</p>
                  <p className="text-sm mt-2">
                    <strong>License:</strong> MIT License<br/>
                    <strong>Website:</strong> <a href="https://tailwindcss.com" className=\"text-primary hover:underline">https://tailwindcss.com</a>
                  </p>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-lg">Radix UI</h3>
                  <p className="text-sm text-muted-foreground mb-2">Multiple Components</p>
                  <p>Low-level UI primitives with accessibility built-in.</p>
                  <p className="text-sm mt-2">
                    <strong>License:</strong> MIT License<br/>
                    <strong>Website:</strong> <a href="https://radix-ui.com" className=\"text-primary hover:underline">https://radix-ui.com</a><br/>
                    <strong>Components:</strong> Dialog, Accordion, Select, Tabs, Toast, and more
                  </p>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-lg">Lucide React</h3>
                  <p className="text-sm text-muted-foreground mb-2">Version: 0.475.0</p>
                  <p>Beautiful & consistent icon toolkit.</p>
                  <p className="text-sm mt-2">
                    <strong>License:</strong> ISC License<br/>
                    <strong>Website:</strong> <a href="https://lucide.dev" className=\"text-primary hover:underline">https://lucide.dev</a>
                  </p>
                </div>
              </div>
            </section>

            <Separator />

            <section>
              <h2 className="font-headline text-2xl text-primary mb-4">Form Handling & Validation</h2>
              
              <div className="space-y-6">
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-lg">React Hook Form</h3>
                  <p className="text-sm text-muted-foreground mb-2">Version: 7.54.2</p>
                  <p>Performant, flexible forms with easy validation.</p>
                  <p className="text-sm mt-2">
                    <strong>License:</strong> MIT License<br/>
                    <strong>Used in:</strong> All tool input forms across KLUTZ
                  </p>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-lg">Zod</h3>
                  <p className="text-sm text-muted-foreground mb-2">Version: 3.24.2</p>
                  <p>TypeScript-first schema validation with static type inference.</p>
                  <p className="text-sm mt-2">
                    <strong>License:</strong> MIT License<br/>
                    <strong>Used in:</strong> Form validation across all KLUTZ tools
                  </p>
                </div>
              </div>
            </section>

            <Separator />

            <section>
              <h2 className="font-headline text-2xl text-primary mb-4">Typography & Fonts</h2>
              
              <div className="space-y-6">
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-lg">Google Fonts</h3>
                  <p>Free and open source font families.</p>
                  <div className="text-sm mt-2 space-y-1">
                    <p><strong>PT Sans:</strong> Body text font - SIL Open Font License</p>
                    <p><strong>Space Grotesk:</strong> Headline font - SIL Open Font License</p>
                    <p><strong>Website:</strong> <a href="https://fonts.google.com" className=\"text-primary hover:underline">https://fonts.google.com</a></p>
                  </div>
                </div>
              </div>
            </section>

            <Separator />

            <section>
              <h2 className="font-headline text-2xl text-primary mb-4">Development Tools</h2>
              
              <div className="space-y-6">
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-lg">TypeScript</h3>
                  <p className="text-sm text-muted-foreground mb-2">Version: 5.x</p>
                  <p>Typed superset of JavaScript that compiles to plain JavaScript.</p>
                  <p className="text-sm mt-2">
                    <strong>License:</strong> Apache License 2.0<br/>
                    <strong>Copyright:</strong> Microsoft Corporation
                  </p>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-lg">Class Variance Authority</h3>
                  <p className="text-sm text-muted-foreground mb-2">Version: 0.7.1</p>
                  <p>Creating variants with the cva function.</p>
                  <p className="text-sm mt-2">
                    <strong>License:</strong> Apache License 2.0
                  </p>
                </div>
              </div>
            </section>

            <Separator />

            <section>
              <h2 className="font-headline text-2xl text-primary mb-4">Image Processing</h2>
              
              <div className="space-y-6">
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-lg">Canvas API</h3>
                  <p>Browser-native image processing for all KLUTZ tools.</p>
                  <p className="text-sm mt-2">
                    <strong>Used in:</strong> Image preprocessing for MediScan AI, Problem Solver, Translator, 
                    Troubleshooters, Measuring Tool, Ingredients Checker, and other image-based tools.
                  </p>
                </div>
              </div>
            </section>

            <Separator />

            <section>
              <h2 className="font-headline text-2xl text-primary mb-4">License Compliance</h2>
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-md border border-green-200 dark:border-green-800">
                <h3 className="font-semibold text-lg text-green-700 dark:text-green-300 mb-2">Our Commitment</h3>
                <ul className="list-disc pl-6 space-y-1 text-green-600 dark:text-green-400">
                  <li>We comply with all open source license requirements</li>
                  <li>Attribution is provided where required</li>
                  <li>We contribute back to the open source community when possible</li>
                  <li>License terms are respected for all dependencies</li>
                </ul>
              </div>
            </section>

            <Separator />

            <section>
              <h2 className="font-headline text-2xl text-primary mb-4">Full License Texts</h2>
              <p>
                Complete license texts for all dependencies are available in the source code repository. 
                For specific license inquiries or to request full license texts, please contact us.
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="font-headline text-2xl text-primary mb-4">Contact</h2>
              <div className="flex items-center space-x-2">
                <Mail className="h-5 w-5 text-accent" />
                <span>For license-related questions, contact us at: </span>
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