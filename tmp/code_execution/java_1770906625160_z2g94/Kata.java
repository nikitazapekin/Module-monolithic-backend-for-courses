public class Kata {
    public static int yourFunction(int n) {
        // Ваш код здесь
        return n+1;
    }
    
    public static void main(String[] args) {
        // Тестовый вызов функции
        Object result = yourFunction(8);
        
        // Выводим результат в консоль в формате JSON
        if (result instanceof int[]) {
            int[] arr = (int[]) result;
            System.out.print("[");
            for (int i = 0; i < arr.length; i++) {
                System.out.print(arr[i]);
                if (i < arr.length - 1) System.out.print(", ");
            }
            System.out.println("]");
        } else {
            System.out.println(result);
        }
    }
}