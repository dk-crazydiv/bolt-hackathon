Here's the fixed version with all closing brackets added:

```javascript
                    type="monotone"
                    dataKey="visits"
                    stroke="#3b82f6"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>🕒 24-Hour Activity Pattern</CardTitle>
              <CardDescription>Hourly usage across device types</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={crossDevicePatterns.timeBasedUsage}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="mobile"
                    stroke={DEVICE_COLORS.mobile}
                    strokeWidth={2}
                    name="Mobile"
                  />
                  <Line
                    type="monotone"
                    dataKey="tablet"
                    stroke={DEVICE_COLORS.tablet}
                    strokeWidth={2}
                    name="Tablet"
                  />
                  <Line
                    type="monotone"
                    dataKey="laptop"
                    stroke={DEVICE_COLORS.laptop}
                    strokeWidth={2}
                    name="Laptop"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
```