import java.util.*;
public class Solution {
public static int solution(int n) {
    // Ваш код здесь
    return n;

  public static void main(String[] args) {
    Object result = solution({"studentName": "John Doe"});
    System.out.println("===RESULT_START_2===");
    System.out.println(result instanceof int[] ? Arrays.toString((int[])result) : String.valueOf(result));
    System.out.println("===RESULT_END_2===");
  }
}