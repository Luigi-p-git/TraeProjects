import { test, expect } from '@playwright/test';

test.describe('Análisis de Trae.ai', () => {
  test('debe analizar trae.ai correctamente y mostrar screenshot y outputs esperados', async ({ page }) => {
    // Ir a la aplicación Web Analyzer
    await page.goto('http://localhost:3000');
    
    // Verificar que la página cargó correctamente
    await expect(page.locator('h1')).toContainText('Web Analyzer');
    
    // Localizar elementos de entrada
    const urlInput = page.locator('input#url');
    const analyzeButton = page.locator('button').filter({ hasText: 'Analyze Website' });
    
    // Verificar que los elementos están presentes
    await expect(urlInput).toBeVisible();
    await expect(analyzeButton).toBeVisible();
    
    // Ingresar la URL de trae.ai
    await urlInput.fill('https://trae.ai');
    
    // Verificar que el input se llenó correctamente
    await expect(urlInput).toHaveValue('https://trae.ai');
    
    // Hacer clic en el botón de análisis
    await analyzeButton.click();
    
    // Verificar que el análisis comenzó (botón deshabilitado y texto de carga)
    await expect(analyzeButton).toBeDisabled();
    await expect(page.locator('text=Analyzing Website')).toBeVisible();
    
    // Esperar a que aparezca "Analysis Complete" (máximo 2 minutos)
    await expect(page.locator('text=Analysis Complete')).toBeVisible({ timeout: 120000 });
    
    console.log('✅ Análisis completado exitosamente');
    
    // Tomar screenshot del resultado completo
    await page.screenshot({ 
      path: 'test-results/trae-ai-analysis-complete.png', 
      fullPage: true 
    });
    
    console.log('📸 Screenshot completo capturado');
    
    // Verificar que aparecieron las pestañas principales de análisis
    const expectedTabs = [
      'Overview',
      'Tech Stack',
      'Design System', 
      'Components',
      'SEO Analysis',
      'Performance'
    ];
    
    console.log('=== VERIFICANDO PESTAÑAS DE ANÁLISIS ===');
    for (const tab of expectedTabs) {
      const tabElement = page.locator(`button:has-text("${tab}")`);
      await expect(tabElement).toBeVisible({ timeout: 5000 });
      console.log(`✅ Pestaña "${tab}" encontrada`);
    }
    
    // Verificar que hay un preview de la página
    await expect(page.locator('text=Website Preview')).toBeVisible();
    console.log('✅ Preview de la página encontrado');
    
    // Verificar que el botón de exportar está disponible
    await expect(page.locator('button:has-text("Export Report")')).toBeVisible();
    console.log('✅ Botón de exportar reporte encontrado');
    
    // Hacer clic en cada pestaña para verificar el contenido
    for (const tab of expectedTabs) {
      console.log(`🔍 Verificando contenido de pestaña: ${tab}`);
      
      const tabButton = page.locator(`button:has-text("${tab}")`);
      await tabButton.click();
      await page.waitForTimeout(1000); // Pequeña pausa para que cargue el contenido
      
      // Tomar screenshot de cada pestaña
      await page.screenshot({ 
        path: `test-results/trae-ai-${tab.toLowerCase().replace(' ', '-')}.png`,
        fullPage: true
      });
      
      // Verificar que hay contenido en la pestaña
      const tabContent = await page.locator('main').textContent();
      expect(tabContent?.length || 0).toBeGreaterThan(100);
      console.log(`✅ Contenido verificado para ${tab}`);
    }
    
    // Verificar que el botón volvió a estar habilitado
    await expect(analyzeButton).toBeEnabled();
    console.log('✅ Botón de análisis habilitado nuevamente');
    
    // Verificaciones finales de calidad
    const pageContent = await page.textContent('body');
    
    // No debe haber errores críticos
    expect(pageContent).not.toContain('Network Error');
    expect(pageContent).not.toContain('Failed to analyze');
    expect(pageContent).not.toContain('Analyzing Website'); // Ya no debe estar analizando
    
    console.log('\n🎉 ANÁLISIS DE TRAE.AI COMPLETADO EXITOSAMENTE');
    console.log(`📊 Contenido total: ${pageContent?.length || 0} caracteres`);
  });
  
  test('debe verificar la calidad del contenido en cada pestaña', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    const urlInput = page.locator('input#url');
    const analyzeButton = page.locator('button').filter({ hasText: 'Analyze Website' });
    
    await urlInput.fill('https://trae.ai');
    await analyzeButton.click();
    
    // Esperar a que se complete el análisis
    await expect(page.locator('text=Analysis Complete')).toBeVisible({ timeout: 120000 });
    
    console.log('=== VERIFICACIÓN DETALLADA DE CALIDAD ===');
    
    // Verificar Tech Stack
    await page.locator('button:has-text("Tech Stack")').click();
    await page.waitForTimeout(1000);
    
    const techStackContent = await page.locator('main').textContent();
    console.log('🔧 Verificando Tech Stack...');
    
    const hasTechInfo = /React|JavaScript|CSS|HTML|Framework|Library/i.test(techStackContent || '');
    console.log(`${hasTechInfo ? '✅' : '❌'} Tecnologías detectadas: ${hasTechInfo}`);
    expect(hasTechInfo).toBeTruthy();
    
    // Verificar Design System
    await page.locator('button:has-text("Design System")').click();
    await page.waitForTimeout(1000);
    
    const designContent = await page.locator('main').textContent();
    console.log('🎨 Verificando Design System...');
    
    const hasDesignInfo = /color|font|#[0-9a-fA-F]{3,6}|rgb|typography/i.test(designContent || '');
    console.log(`${hasDesignInfo ? '✅' : '❌'} Información de diseño: ${hasDesignInfo}`);
    
    // Verificar Components
    await page.locator('button:has-text("Components")').click();
    await page.waitForTimeout(1000);
    
    const componentsContent = await page.locator('main').textContent();
    console.log('🧩 Verificando Components...');
    
    const hasComponents = /header|nav|main|section|div|button|input|component/i.test(componentsContent || '');
    console.log(`${hasComponents ? '✅' : '❌'} Componentes detectados: ${hasComponents}`);
    
    // Verificar SEO Analysis
    await page.locator('button:has-text("SEO Analysis")').click();
    await page.waitForTimeout(1000);
    
    const seoContent = await page.locator('main').textContent();
    console.log('🔍 Verificando SEO Analysis...');
    
    const hasSeoInfo = /title|description|meta|heading|seo/i.test(seoContent || '');
    console.log(`${hasSeoInfo ? '✅' : '❌'} Información SEO: ${hasSeoInfo}`);
    
    // Verificar Performance
    await page.locator('button:has-text("Performance")').click();
    await page.waitForTimeout(1000);
    
    const performanceContent = await page.locator('main').textContent();
    console.log('⚡ Verificando Performance...');
    
    const hasPerformanceInfo = /load|time|ms|performance|resource|speed/i.test(performanceContent || '');
    console.log(`${hasPerformanceInfo ? '✅' : '❌'} Métricas de rendimiento: ${hasPerformanceInfo}`);
    
    // Verificaciones de calidad general
    const fullContent = await page.textContent('body');
    const emptyArrays = (fullContent?.match(/\[\]/g) || []).length;
    const unknownValues = (fullContent?.match(/Unknown/g) || []).length;
    
    console.log('\n📊 MÉTRICAS DE CALIDAD:');
    console.log(`- Arrays vacíos: ${emptyArrays}`);
    console.log(`- Valores "Unknown": ${unknownValues}`);
    console.log(`- Contenido total: ${fullContent?.length || 0} caracteres`);
    
    // El contenido debe ser sustancial
     expect(fullContent?.length || 0).toBeGreaterThan(300);
    
    // No debe haber demasiados arrays vacíos o valores desconocidos
    expect(emptyArrays).toBeLessThan(10);
    expect(unknownValues).toBeLessThan(8);
    
    console.log('\n✅ VERIFICACIÓN DE CALIDAD COMPLETADA');
  });
  
  test('debe capturar screenshots detallados del proceso', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Screenshot inicial
    await page.screenshot({ 
      path: 'test-results/trae-ai-01-inicial.png',
      fullPage: true
    });
    
    const urlInput = page.locator('input#url');
    const analyzeButton = page.locator('button').filter({ hasText: 'Analyze Website' });
    
    await urlInput.fill('https://trae.ai');
    
    // Screenshot con URL ingresada
    await page.screenshot({ 
      path: 'test-results/trae-ai-02-url-ingresada.png',
      fullPage: true
    });
    
    await analyzeButton.click();
    
    // Screenshot durante análisis
    await page.screenshot({ 
      path: 'test-results/trae-ai-03-analizando.png',
      fullPage: true
    });
    
    // Esperar a que se complete
    await expect(page.locator('text=Analysis Complete')).toBeVisible({ timeout: 120000 });
    
    // Screenshot final con resultados
    await page.screenshot({ 
      path: 'test-results/trae-ai-04-resultados-finales.png',
      fullPage: true
    });
    
    console.log('📸 Todos los screenshots del proceso capturados exitosamente');
    
    // Verificar que el análisis se completó correctamente
    const finalContent = await page.textContent('body');
    expect(finalContent).toContain('Analysis Complete');
    expect(finalContent).toContain('Website Preview');
    expect(finalContent?.length || 0).toBeGreaterThan(300);
    
    console.log('✅ Proceso completo documentado con screenshots');
  });
});