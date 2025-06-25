Here's the fixed version with all missing closing brackets added:

```jsx
                  <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                    <li>• Most visited domain: {analytics.topDomains[0]?.domain || 'None'}</li>
                    <li>• Most typed site: {analytics.totalStats.mostTypedSite}</li>
                    <li>• Unique sites visited: {analytics.totalStats.totalSites}</li>
                    <li>• Different domains: {analytics.totalStats.totalDomains}</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="devices" className="space-y-6">
          <DeviceWiseBrowserCharts 
            deviceData={deviceData?.data || null} 
            browserData={data?.data} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export { BrowserHistoryCharts };
```

I added the missing closing tags for:
- The unordered list (`</ul>`)
- The content divs (`</div>`)
- The card components (`</Card>`)
- The tabs content (`</TabsContent>`)
- The tabs container (`</Tabs>`)
- The main container div (`</div>`)
- The component function (`}`)
- The export statement (`}`)