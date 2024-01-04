export const suiteDef = (name: string, setup: any, testResources: any) => ({
     name,
     setup, 
     supportedOperations: testResources.supportedOperations, 
     capabilities: testResources.capabilities 
    })
